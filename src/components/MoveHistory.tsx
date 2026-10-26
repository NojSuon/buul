import { useEffect, useRef } from 'react';
import type { Move } from '../game';
import { useStrings } from '../i18n';

interface Props {
  gameId: string;
  moves: Move[];
}

export default function MoveHistory({ gameId, moves }: Props) {
  const t = useStrings();
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [moves.length]);

  return (
    <aside className="sidebar sidebar-right">
      <h2 className="game-id">
        {t.gameId}: {gameId}
      </h2>
      <div className="pill-button pill-static">{t.moves}</div>
      <hr className="rule" />
      <ol className="history" ref={listRef}>
        {moves.length === 0 && <li className="history-empty">{t.noMoves}</li>}
        {moves.map((move, i) => (
          <li key={i} className={`history-item bg-${move.player === 'A' ? 'teal' : 'orange'}`}>
            {move.label.replace('pass', t.pass)}
          </li>
        ))}
      </ol>
      <hr className="rule" />
    </aside>
  );
}
