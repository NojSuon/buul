export type Player = 'A' | 'B';
export type Mode = 'race' | 'capture';
export type Opponent = 'online' | 'bot';

export const COLUMNS = 'ABCDEFGHIJK'.split('');
export const ROWS = 5;

export const MODES: { id: Mode; name: string }[] = [
  { id: 'race', name: "Ixi'im Beel" },
  { id: 'capture', name: "Noj Ba'atel" },
];

export interface Piece {
  id: string;
  player: Player;
  row: number;
  col: number;
}

export interface Move {
  player: Player;
  label: string;
}

// The capture made by the previous move, if it was one. Noj Ba'atel uses it for rescues and truces.
export interface LastCapture {
  by: string;
  victim: string;
  rescue: boolean;
}

export interface GameState {
  mode: Mode;
  pieces: Piece[];
  // Pieces captured in Noj Ba'atel, kept so a rescue or truce can bring them back.
  out: Piece[];
  crowned: Record<Player, number>;
  captured: Record<Player, number>;
  dice: Record<Player, boolean[] | null>;
  roll: number | null;
  turn: Player;
  moves: Move[];
  lastCapture: LastCapture | null;
  // A special outcome of the last move, for the board to announce.
  event: 'rescue' | 'truce' | null;
  winner: Player | 'draw' | null;
}

function startingPieces(): Piece[] {
  const pieces: Piece[] = [];
  for (let row = 0; row < ROWS; row++) {
    pieces.push({ id: `A${row}`, player: 'A', row, col: 0 });
    pieces.push({ id: `B${row}`, player: 'B', row, col: COLUMNS.length - 1 });
  }
  return pieces;
}

export function newGame(mode: Mode): GameState {
  return {
    mode,
    pieces: startingPieces(),
    out: [],
    crowned: { A: 0, B: 0 },
    captured: { A: 0, B: 0 },
    dice: { A: null, B: null },
    roll: null,
    turn: 'A',
    moves: [],
    lastCapture: null,
    event: null,
    winner: null,
  };
}

export const other = (player: Player): Player => (player === 'A' ? 'B' : 'A');

// Player A marches left to right, player B right to left.
const direction = (player: Player) => (player === 'A' ? 1 : -1);
export const homeCol = (player: Player) => (player === 'A' ? 0 : COLUMNS.length - 1);
const onBoard = (col: number) => col >= 0 && col < COLUMNS.length;
export const targetCol = (piece: Piece, roll: number) => piece.col + direction(piece.player) * roll;

// Four two-faced dice: the roll is the number of marked faces, and no marks counts as 5.
export function throwDice(): boolean[] {
  return Array.from({ length: 4 }, () => Math.random() < 0.5);
}

export function diceValue(dice: boolean[]): number {
  const marked = dice.filter(Boolean).length;
  return marked === 0 ? 5 : marked;
}

export function canMove(state: GameState, piece: Piece): boolean {
  if (state.roll === null || state.winner || piece.player !== state.turn) return false;
  const col = targetCol(piece, state.roll);
  // Reaching or overshooting the end crowns the piece or sends it back to base.
  if (!onBoard(col) || col === homeCol(other(piece.player))) return true;
  // A team can have only one piece per column outside its home column.
  return !state.pieces.some((p) => p.player === piece.player && p.col === col);
}

export function legalMoves(state: GameState): Piece[] {
  return state.pieces.filter((piece) => canMove(state, piece));
}

const endTurn = (state: GameState): GameState => ({ ...state, roll: null, turn: other(state.turn) });

export function applyRoll(state: GameState, dice: boolean[]): GameState {
  if (state.roll !== null || state.winner) return state;
  const roll = diceValue(dice);
  const next = { ...state, dice: { ...state.dice, [state.turn]: dice }, roll };
  if (legalMoves(next).length > 0) return next;
  return endTurn({
    ...next,
    lastCapture: null,
    event: null,
    moves: [...next.moves, { player: state.turn, label: `${roll}-pass` }],
  });
}

// Where a piece would end up with the current roll. `col` is the column it lands on (the last column
// when it is crowned, its own home column when it goes back to base).
// A capture in Noj Ba'atel can also rescue a piece or trigger a truce (see movePiece).
export interface MovePreview {
  kind: 'move' | 'capture' | 'crown' | 'base';
  col: number;
  capturedId?: string;
  effect?: 'rescue' | 'truce';
}

export function previewMove(state: GameState, pieceId: string): MovePreview | null {
  const piece = state.pieces.find((p) => p.id === pieceId);
  if (!piece || !canMove(state, piece)) return null;

  const col = targetCol(piece, state.roll!);
  const lastCol = homeCol(other(piece.player));

  // In the race a piece is crowned only by landing exactly on the last column.
  if (state.mode === 'race' && col === lastCol) return { kind: 'crown', col: lastCol };
  // Overshooting the end (or, in capture mode, reaching it) sends the piece back to base.
  if (!onBoard(col) || col === lastCol) return { kind: 'base', col: homeCol(piece.player) };
  // Moving into a column held by an enemy captures it, whatever its row. Nobody ever lands
  // in the enemy's home column, so pieces waiting at home are safe.
  const enemy = state.pieces.find((p) => p.player !== piece.player && p.col === col);
  if (!enemy) return { kind: 'move', col };

  // In Noj Ba'atel, capturing the piece that made the previous move's capture is special: if
  // that capture was itself a rescue, it's a truce; otherwise it rescues the piece it took.
  const last = state.lastCapture;
  const effect = state.mode === 'capture' && last?.by === enemy.id ? (last.rescue ? 'truce' : 'rescue') : undefined;
  return { kind: 'capture', col, capturedId: enemy.id, effect };
}

export function movePiece(state: GameState, pieceId: string): GameState {
  const preview = previewMove(state, pieceId);
  if (!preview) return state;

  const piece = state.pieces.find((p) => p.id === pieceId)!;
  const crowned = { ...state.crowned };
  let captured = { ...state.captured };
  let pieces = state.pieces.filter((p) => p.id !== piece.id);
  let out = state.out;
  let lastCapture: LastCapture | null = null;
  let to = COLUMNS[preview.col];

  if (preview.kind === 'crown') {
    crowned[piece.player]++;
    to = '♛';
  } else {
    pieces.push({ ...piece, col: preview.col });
    if (preview.kind === 'capture') {
      const enemy = pieces.find((p) => p.id === preview.capturedId)!;
      pieces = pieces.filter((p) => p !== enemy);
      captured[piece.player]++;
      to += '×';
      if (state.mode === 'race') {
        // In the race the captured piece starts over.
        pieces.push({ ...enemy, col: homeCol(enemy.player) });
      } else {
        // In capture mode it is out of the game...
        out = [...out, enemy];
        lastCapture = { by: piece.id, victim: enemy.id, rescue: preview.effect === 'rescue' };
        if (preview.effect === 'rescue') {
          // ...unless it rescues the piece the enemy just took: that piece returns to base and
          // the enemy loses the point for it.
          const rescued = out.find((p) => p.id === state.lastCapture!.victim)!;
          out = out.filter((p) => p !== rescued);
          pieces.push({ ...rescued, col: homeCol(rescued.player) });
          captured[enemy.player]--;
          to += '↺';
        } else if (preview.effect === 'truce') {
          // Capturing the rescuer straight back is a truce: every piece returns to base.
          pieces = startingPieces();
          out = [];
          captured = { A: 0, B: 0 };
          lastCapture = null;
          to += '⟲';
        }
      }
    }
  }

  const roll = state.roll!;

  return endTurn({
    ...state,
    pieces,
    out,
    crowned,
    captured,
    lastCapture,
    event: preview.effect ?? null,
    winner: findWinner(state.mode, crowned, captured),
    moves: [...state.moves, { player: piece.player, label: `${roll}-${COLUMNS[piece.col]},${to}` }],
  });
}

// Race: first to crown all five pieces. Capture: first to capture all five enemy pieces.
function findWinner(
  mode: Mode,
  crowned: Record<Player, number>,
  captured: Record<Player, number>,
): GameState['winner'] {
  const players: Player[] = ['A', 'B'];
  const score = mode === 'race' ? crowned : captured;
  return players.find((p) => score[p] === ROWS) ?? null;
}
