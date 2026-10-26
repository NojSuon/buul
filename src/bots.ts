import {
  COLUMNS,
  canMove,
  homeCol,
  legalMoves,
  movePiece,
  other,
  targetCol,
  type GameState,
  type Piece,
} from './game';

export type Personality = 'aggressive' | 'defensive' | 'moderate';

export interface Bot {
  id: string;
  name: string;
  personality: Personality;
}

export const BOTS: Bot[] = [
  { id: 'yaax-kuk-mo', name: "Ya'ax K'uk' Mo'", personality: 'aggressive' },
  { id: 'siyaj-kaak', name: "Siyaj K'áak'", personality: 'aggressive' },
  { id: 'chan-kawil', name: "Chan K'awil", personality: 'defensive' },
  { id: 'kaan-baalam', name: 'Kaan Báalam', personality: 'defensive' },
  { id: 'kinich-paakal', name: "K'inich Paakal", personality: 'moderate' },
  { id: 'chan-yoopat', name: "Chan Yo'opat", personality: 'moderate' },
];

export const randomBot = (): Bot => BOTS[Math.floor(Math.random() * BOTS.length)];

// Chance of each roll with four two-sided dice, where no marks counts as 5.
const ROLL_ODDS: [roll: number, odds: number][] = [
  [1, 4 / 16],
  [2, 6 / 16],
  [3, 4 / 16],
  [4, 1 / 16],
  [5, 1 / 16],
];

// Chance that the enemy can capture this piece with their next roll.
function risk(state: GameState, piece: Piece): number {
  if (piece.col === homeCol(piece.player)) return 0;
  const enemy = other(piece.player);
  let chance = 0;
  for (const [roll, odds] of ROLL_ODDS) {
    const enemyTurn: GameState = { ...state, turn: enemy, roll, winner: null };
    const threatened = state.pieces.some(
      (e) => e.player === enemy && targetCol(e, roll) === piece.col && canMove(enemyTurn, e),
    );
    if (threatened) chance += odds;
  }
  return chance;
}

// Chance that this piece can capture an enemy with its owner's next roll.
function threat(state: GameState, piece: Piece): number {
  const enemy = other(piece.player);
  let chance = 0;
  for (const [roll, odds] of ROLL_ODDS) {
    const col = targetCol(piece, roll);
    const myTurn: GameState = { ...state, turn: piece.player, roll, winner: null };
    const canHit =
      col !== homeCol(enemy) &&
      canMove(myTurn, piece) &&
      state.pieces.some((e) => e.player === enemy && e.col === col);
    if (canHit) chance += odds;
  }
  return chance;
}

const travelled = (piece: Piece) => (piece.player === 'A' ? piece.col : COLUMNS.length - 1 - piece.col);

// How much each personality values a capture, a crown, ground gained, lining up a capture for next
// turn, and the danger to the moved piece and to the rest of its team afterwards. Noise keeps the
// bots from being fully predictable.
interface Weights {
  capture: number;
  crown: number;
  progress: number;
  threat: number;
  risk: number;
  teamRisk: number;
  noise: number;
}

const WEIGHTS: Record<Personality, Weights> = {
  aggressive: { capture: 20, crown: 6, progress: 1, threat: 6, risk: 0, teamRisk: 0, noise: 0.5 },
  defensive: { capture: 3, crown: 6, progress: 0.2, threat: 0, risk: 20, teamRisk: 8, noise: 0.5 },
  moderate: { capture: 8, crown: 6, progress: 0.5, threat: 2, risk: 6, teamRisk: 2, noise: 1.5 },
};

// Picks the bot's piece to move for the current roll, or undefined if none can move.
export function chooseMove(state: GameState, personality: Personality): string | undefined {
  const me = state.turn;
  const w = WEIGHTS[personality];
  let best: string | undefined;
  let bestScore = -Infinity;

  const enemy = other(me);

  for (const piece of legalMoves(state)) {
    const next = movePiece(state, piece.id);
    // Net change in the capture score: a rescue also takes a point from the enemy, and a truce
    // wipes both scores.
    const captureGain =
      next.captured[me] - state.captured[me] - (next.captured[enemy] - state.captured[enemy]);
    const moved = next.pieces.find((p) => p.id === piece.id);
    const progress = moved ? travelled(moved) - travelled(piece) : COLUMNS.length - 1 - travelled(piece);
    const teamRisk = next.pieces
      .filter((p) => p.player === me && p.id !== piece.id)
      .reduce((sum, p) => sum + risk(next, p), 0);

    const score =
      (next.winner === me ? 1000 : 0) +
      w.capture * captureGain +
      w.crown * (next.crowned[me] - state.crowned[me]) +
      w.progress * progress +
      w.threat * (moved ? threat(next, moved) : 0) -
      w.risk * (moved ? risk(next, moved) : 0) -
      w.teamRisk * teamRisk +
      w.noise * Math.random();

    if (score > bestScore) {
      bestScore = score;
      best = piece.id;
    }
  }
  return best;
}
