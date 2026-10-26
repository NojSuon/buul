export type Player = 'A' | 'B';
export type Mode = 'race' | 'capture';
export type Opponent = 'online' | 'bot';

export const COLUMNS = 'ABCDEFGHIJK'.split('');
export const ROWS = 5;

export const MODES: { id: Mode; name: string; blurb: string }[] = [
  {
    id: 'race',
    name: "Ixi'im Beel",
    blurb: 'Maize race: run against your opponent to claim the crown on your troops',
  },
  {
    id: 'capture',
    name: "Noj Ba'atel",
    blurb: 'Capture mode: fight against your enemies and capture their armies',
  },
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

export interface GameState {
  mode: Mode;
  pieces: Piece[];
  crowned: Record<Player, number>;
  captured: Record<Player, number>;
  dice: Record<Player, boolean[] | null>;
  roll: number | null;
  turn: Player;
  moves: Move[];
  winner: Player | 'draw' | null;
}

export function newGame(mode: Mode): GameState {
  const pieces: Piece[] = [];
  for (let row = 0; row < ROWS; row++) {
    pieces.push({ id: `A${row}`, player: 'A', row, col: 0 });
    pieces.push({ id: `B${row}`, player: 'B', row, col: COLUMNS.length - 1 });
  }
  return {
    mode,
    pieces,
    crowned: { A: 0, B: 0 },
    captured: { A: 0, B: 0 },
    dice: { A: null, B: null },
    roll: null,
    turn: 'A',
    moves: [],
    winner: null,
  };
}

export const other = (player: Player): Player => (player === 'A' ? 'B' : 'A');

// Player A marches left to right, player B right to left.
const direction = (player: Player) => (player === 'A' ? 1 : -1);
const onBoard = (col: number) => col >= 0 && col < COLUMNS.length;
const targetCol = (piece: Piece, roll: number) => piece.col + direction(piece.player) * roll;

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
  if (!onBoard(col)) return true; // leaves the board and gets crowned
  const occupant = state.pieces.find((p) => p.row === piece.row && p.col === col);
  if (!occupant) return true;
  return state.mode === 'capture' && occupant.player !== piece.player;
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
  return endTurn({ ...next, moves: [...next.moves, { player: state.turn, label: `${roll}-pass` }] });
}

export function movePiece(state: GameState, pieceId: string): GameState {
  const piece = state.pieces.find((p) => p.id === pieceId);
  if (!piece || !canMove(state, piece)) return state;

  const roll = state.roll!;
  const col = targetCol(piece, roll);
  const crowned = { ...state.crowned };
  const captured = { ...state.captured };
  let pieces = state.pieces.filter((p) => p.id !== piece.id);
  let to: string;

  if (onBoard(col)) {
    to = COLUMNS[col];
    const occupant = pieces.find((p) => p.row === piece.row && p.col === col);
    if (occupant) {
      pieces = pieces.filter((p) => p !== occupant);
      captured[piece.player]++;
      to += '×';
    }
    pieces.push({ ...piece, col });
  } else {
    crowned[piece.player]++;
    to = '♛';
  }

  return endTurn({
    ...state,
    pieces,
    crowned,
    captured,
    winner: findWinner(pieces, crowned, captured),
    moves: [...state.moves, { player: piece.player, label: `${roll}-${COLUMNS[piece.col]},${to}` }],
  });
}

// The game ends once either side has no pieces left on the board; crowns and captures both score.
function findWinner(
  pieces: Piece[],
  crowned: Record<Player, number>,
  captured: Record<Player, number>,
): GameState['winner'] {
  const hasPieces = (player: Player) => pieces.some((p) => p.player === player);
  if (hasPieces('A') && hasPieces('B')) return null;
  const a = crowned.A + captured.A;
  const b = crowned.B + captured.B;
  if (a === b) return 'draw';
  return a > b ? 'A' : 'B';
}
