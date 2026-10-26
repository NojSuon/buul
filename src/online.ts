import { useEffect, useRef, useState } from 'react';
import type { GameState, Mode, Player } from './game';
import type { JoinResult, OnlineGame } from './onlineService';

type Service = typeof import('./onlineService');

// The online game this browser is in. It's remembered across reloads so a player can come back.
interface Session {
  code: string;
  side: Player;
}

export type OnlineError = 'not-found' | 'full' | 'guests-disabled' | 'connection';

const STORAGE_KEY = 'buul.online';

function loadSession(): Session | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
  } catch {
    return null;
  }
}

function storeSession(session: Session | null) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Not remembered across reloads, but the game still works.
  }
}

export function toOnlineError(e: unknown): OnlineError {
  const code = (e as { code?: string })?.code ?? '';
  if (code === 'auth/admin-restricted-operation' || code === 'auth/operation-not-allowed') return 'guests-disabled';
  return 'connection';
}

export const formatCode = (code: string) => `${code.slice(0, 3)}-${code.slice(3)}`;
export const inviteLink = (code: string) =>
  `${window.location.origin}${window.location.pathname}?join=${code}`;

// `uid` is the signed-in player (or guest); the game is only watched once it's known.
export function useOnlineGame(uid: string | null) {
  const service = useRef<Promise<Service> | null>(null);
  const [session, setSession] = useState<Session | null>(loadSession);
  const [game, setGame] = useState<OnlineGame | null>(null);
  const [connectionError, setConnectionError] = useState(false);

  const getService = () => (service.current ??= import('./onlineService'));

  const changeSession = (next: Session | null) => {
    storeSession(next);
    setSession(next);
    if (!next) setGame(null);
  };

  // Once per visit, tidy away this player's games that are over two days old.
  useEffect(() => {
    if (!uid) return;
    getService().then((s) => s.cleanUpGames(uid, loadSession()?.code ?? null, false)).catch(() => {});
  }, [uid]);

  useEffect(() => {
    if (!session || !uid) return;
    let unsubscribe = () => {};
    let cancelled = false;
    getService().then((s) => {
      if (cancelled) return;
      unsubscribe = s.watchGame(
        session.code,
        (next) => {
          setConnectionError(false);
          // The game was deleted (the other player cancelled or both left).
          if (!next) changeSession(null);
          else setGame(next);
        },
        () => {
          // Not allowed to read it any more (e.g. it ended and was replaced): forget it.
          setConnectionError(true);
          changeSession(null);
        },
      );
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [session?.code, uid]);

  const create = async (mode: Mode, playerUid: string, nickname: string) => {
    const s = await getService();
    const code = await s.createGame(mode, { uid: playerUid, nickname });
    changeSession({ code, side: 'A' });
  };

  const join = async (code: string, playerUid: string, nickname: string): Promise<JoinResult> => {
    const s = await getService();
    const result = await s.joinGame(code, { uid: playerUid, nickname });
    if ('side' in result) changeSession({ code, side: result.side });
    return result;
  };

  // Shows the move straight away, then saves it for the other player.
  const saveState = async (state: GameState) => {
    if (!session || !game) return;
    setGame({ ...game, state });
    await (await getService()).saveState(session.code, state);
  };

  const leave = async () => {
    const current = game;
    const side = session?.side;
    changeSession(null);
    if (current && side) await (await getService()).leaveGame(current, side).catch(() => {});
  };

  return { session, game, connectionError, create, join, saveState, leave };
}
