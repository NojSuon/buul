import { useEffect, useRef, useState } from 'react';
import type { Move } from '../game';
import { useStrings } from '../i18n';
import { inviteLink } from '../online';

interface Props {
  gameId: string;
  moves: Move[];
  // In an online game: its code, for the invite link, and a way to leave it.
  onlineCode: string | null;
  onLeave: () => void;
}

export default function MoveHistory({ gameId, moves, onlineCode, onLeave }: Props) {
  const t = useStrings();
  const listRef = useRef<HTMLOListElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [moves.length]);

  useEffect(() => setCopied(false), [onlineCode]);

  const copyInvite = () =>
    navigator.clipboard?.writeText(inviteLink(onlineCode!)).then(() => setCopied(true), () => {});

  return (
    <aside className="sidebar sidebar-right">
      <h2 className="game-id">
        {t.gameId}: {gameId}
      </h2>
      {onlineCode && (
        <div className="online-actions">
          <button className="pill-button online-action" onClick={copyInvite}>
            {copied ? t.online.copied : t.online.copyLink}
          </button>
          <button className="pill-button online-action online-leave" onClick={onLeave}>
            {t.online.leave}
          </button>
        </div>
      )}
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
