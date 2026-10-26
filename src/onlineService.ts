import { Timestamp, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { newGame, type GameState, type Mode, type Player } from './game';

// Online games live in games/{6-digit code}. Player A creates the game and player B joins it with
// the code; then each move writes the whole game state, and both players watch it live. Loaded on
// demand, like accountService.

export interface OnlinePlayer {
  uid: string;
  nickname: string;
}

export interface OnlineGame {
  code: string;
  mode: Mode;
  // left: one player has left; the game is deleted when the other leaves too.
  status: 'waiting' | 'playing' | 'left';
  players: { A: OnlinePlayer; B: OnlinePlayer | null };
  uids: string[];
  state: GameState;
  leftBy: Player | null;
}

export type JoinResult = { side: Player } | { error: 'not-found' | 'full' };

// Games are deleted automatically two days after they start (a Firestore TTL policy on expireAt).
const GAME_LIFETIME_MS = 2 * 24 * 60 * 60 * 1000;

const gameDoc = (code: string) => doc(db, 'games', code);
const randomCode = () => String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');

export async function createGame(mode: Mode, player: OnlinePlayer): Promise<string> {
  // The rules only allow creating a game whose code isn't taken, so a clash fails and we retry.
  for (let attempt = 0; ; attempt++) {
    const code = randomCode();
    try {
      await setDoc(gameDoc(code), {
        mode,
        status: 'waiting',
        players: { A: player, B: null },
        uids: [player.uid],
        state: newGame(mode),
        createdAt: serverTimestamp(),
        expireAt: Timestamp.fromMillis(Date.now() + GAME_LIFETIME_MS),
        leftBy: null,
      });
      return code;
    } catch (e) {
      if (attempt >= 4 || (e as { code?: string }).code !== 'permission-denied') throw e;
    }
  }
}

export async function joinGame(code: string, player: OnlinePlayer): Promise<JoinResult> {
  const snap = await getDoc(gameDoc(code));
  if (!snap.exists()) return { error: 'not-found' };
  const game = snap.data() as OnlineGame;
  // Rejoining a game you're already in (after a reload, say) just picks it up again.
  if (game.players.A.uid === player.uid) return { side: 'A' };
  if (game.players.B?.uid === player.uid) return { side: 'B' };
  if (game.status !== 'waiting') return { error: 'full' };
  await updateDoc(gameDoc(code), {
    'players.B': player,
    uids: [...game.uids, player.uid],
    status: 'playing',
  });
  return { side: 'B' };
}

// Calls back with the game on every change, or null once it no longer exists.
export function watchGame(code: string, onChange: (game: OnlineGame | null) => void, onError: (e: unknown) => void) {
  return onSnapshot(
    gameDoc(code),
    (snap) => onChange(snap.exists() ? ({ ...(snap.data() as Omit<OnlineGame, 'code'>), code } as OnlineGame) : null),
    onError,
  );
}

export const saveState = (code: string, state: GameState) => updateDoc(gameDoc(code), { state });

// Leaving a game nobody else is in (still waiting, or the other player already left) deletes it;
// otherwise the other player is told you left.
export async function leaveGame(game: OnlineGame, side: Player) {
  if (game.status === 'waiting' || game.status === 'left') await deleteDoc(gameDoc(game.code));
  else await updateDoc(gameDoc(game.code), { status: 'left', leftBy: side });
}
