import type { CSSProperties } from 'react';
import type { Player } from './game';

// The colours a player can pick for their pieces. `ink` is the text colour on top of it (the
// Roll button, the scores), dark for the light colours so it stays readable.
export const PIECE_COLORS = [
  { id: 'turquoise', hex: '#0a8aa8', ink: '#ffffff' },
  { id: 'orange', hex: '#f39200', ink: '#ffffff' },
  { id: 'mayaRed', hex: '#b03a2e', ink: '#ffffff' },
  { id: 'mayaYellow', hex: '#f5d21f', ink: '#2e3f58' },
  { id: 'lightGreen', hex: '#7cc650', ink: '#2e3f58' },
  { id: 'mexicanPink', hex: '#e4007c', ink: '#ffffff' },
  { id: 'mayaBlue', hex: '#56a8e6', ink: '#2e3f58' },
  { id: 'purple', hex: '#7b4fa6', ink: '#ffffff' },
  { id: 'cacao', hex: '#7a4b2a', ink: '#ffffff' },
  { id: 'obsidian', hex: '#2b2b2b', ink: '#ffffff' },
] as const;

export type PieceColor = (typeof PIECE_COLORS)[number]['id'];

export const PIECE_COLOR_IDS = PIECE_COLORS.map((c) => c.id);

// Each side's colour when nobody picked one.
export const DEFAULT_COLORS: Record<Player, PieceColor> = { A: 'turquoise', B: 'orange' };

export const isPieceColor = (value: unknown): value is PieceColor =>
  PIECE_COLOR_IDS.includes(value as PieceColor);

// On each screen your own pick always wins. The other side keeps theirs (or its default) unless
// it is the same as yours; then it switches to turquoise, or orange if you are turquoise.
export function resolveColors(mine: PieceColor, mySide: Player, theirs: unknown): Record<Player, PieceColor> {
  const theirSide: Player = mySide === 'A' ? 'B' : 'A';
  let other: PieceColor = isPieceColor(theirs) ? theirs : DEFAULT_COLORS[theirSide];
  if (other === mine) other = mine === 'turquoise' ? 'orange' : 'turquoise';
  return { [mySide]: mine, [theirSide]: other } as Record<Player, PieceColor>;
}

// The CSS variables the board's player-coloured parts read (see .bg-a, .bg-b in styles.css).
export function colorVariables(colors: Record<Player, PieceColor>): CSSProperties {
  const find = (id: PieceColor) => PIECE_COLORS.find((c) => c.id === id)!;
  const a = find(colors.A);
  const b = find(colors.B);
  return { '--color-a': a.hex, '--ink-a': a.ink, '--color-b': b.hex, '--ink-b': b.ink } as CSSProperties;
}
