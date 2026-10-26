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
const homeCol = (player: Player) => (player === 'A' ? 0 : COLUMNS.length - 1);
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
  if (!onBoard(col)) return true; // overshoots the end and goes back to base
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

  if (state.mode === 'race' && col === homeCol(other(piece.player))) {
    // In the race a piece is crowned only by landing exactly on the last column.
    crowned[piece.player]++;
    to = '♛';
  } else if (!onBoard(col)) {
    // Overshooting the end sends the piece back to base to play again.
    const home = homeCol(piece.player);
    pieces.push({ ...piece, col: home });
    to = COLUMNS[home];
  } else {
    to = COLUMNS[col];
    // Moving into a column held by an enemy captures it, whatever its row. Home columns are safe.
    const enemy =
      col !== homeCol(other(piece.player)) &&
      pieces.find((p) => p.player !== piece.player && p.col === col);
    if (enemy) {
      pieces = pieces.filter((p) => p !== enemy);
      captured[piece.player]++;
      // In the race the captured piece starts over; in capture mode it is out of the game.
      if (state.mode === 'race') pieces.push({ ...enemy, col: homeCol(enemy.player) });
      to += '×';
    }
    pieces.push({ ...piece, col });
  }

  return endTurn({
    ...state,
    pieces,
    crowned,
    captured,
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
