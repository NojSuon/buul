import { useId, type CSSProperties } from 'react';
import { COLUMNS, type Player } from '../game';

// A small, static board used to illustrate the rules in the Learn popup.

export interface DiagramPiece {
  player: Player;
  col: number;
  row: number;
  // ghost: where a piece was; captured: taken by the enemy; highlight: where it ends up; crowned: just crowned
  state?: 'ghost' | 'captured' | 'highlight' | 'crowned';
}

export interface DiagramMove {
  row: number;
  from: number;
  // A column past the last one (11) draws the arrow running off the end of the board.
  to: number;
  style?: 'solid' | 'dashed' | 'blocked';
}

interface Props {
  rows?: number;
  pieces: DiagramPiece[];
  moves?: DiagramMove[];
}

const COL_W = 30;
const GAP = 2;
const ROW_H = 30;
const TOP = 14;
const OVERHANG = 26; // room on the right for arrows that run off the board

const COLOR: Record<Player, string> = { A: 'var(--teal)', B: 'var(--orange)' };
const BOARD_W = COLUMNS.length * (COL_W + GAP) - GAP;
const cx = (col: number) => (col >= COLUMNS.length ? BOARD_W + OVERHANG - 6 : col * (COL_W + GAP) + COL_W / 2);
const cy = (row: number) => TOP + row * ROW_H + ROW_H / 2;

export default function MiniBoard({ rows = 3, pieces, moves = [] }: Props) {
  const markerId = `arrow${useId().replace(/:/g, '')}`;
  const height = TOP + rows * ROW_H + 6;

  return (
    <div className="mini-board" style={{ width: BOARD_W + OVERHANG, height }} aria-hidden="true">
      {COLUMNS.map((letter, col) => (
        <div
          key={letter}
          className={`mini-column ${col % 2 ? 'column-dark' : 'column-light'}`}
          style={{ left: col * (COL_W + GAP), width: COL_W, height }}
        >
          <span className="mini-label">{letter}</span>
        </div>
      ))}

      <svg className="mini-arrows" width={BOARD_W + OVERHANG} height={height}>
        <defs>
          <marker id={markerId} viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L6,3 L0,6 z" fill="var(--navy)" />
          </marker>
        </defs>
        {moves.map((move, i) => {
          const dir = Math.sign(move.to - move.from);
          const x1 = cx(move.from) + dir * 8;
          const x2 = move.to >= COLUMNS.length ? cx(move.to) : cx(move.to) - dir * 13;
          const y = cy(move.row) - 6;
          const lift = Math.min(22, 8 + Math.abs(x2 - x1) / 8);
          return (
            <g key={i}>
              <path
                d={`M ${x1} ${y} Q ${(x1 + x2) / 2} ${y - lift} ${x2} ${y}`}
                fill="none"
                stroke="var(--navy)"
                strokeWidth={2}
                strokeDasharray={move.style === 'solid' || !move.style ? undefined : '4 3'}
                markerEnd={move.style === 'blocked' ? undefined : `url(#${markerId})`}
              />
              {move.style === 'blocked' && (
                <text x={x2} y={y + 5} className="mini-blocked" textAnchor="middle">
                  ✕
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {pieces.map((piece, i) => (
        <span
          key={i}
          className={`mini-piece${piece.state ? ` mini-piece-${piece.state}` : ''}`}
          style={{ left: cx(piece.col), top: cy(piece.row), '--piece': COLOR[piece.player] } as CSSProperties}
        >
          {piece.state === 'captured' && '✕'}
          {piece.state === 'crowned' && '♛'}
        </span>
      ))}
    </div>
  );
}
