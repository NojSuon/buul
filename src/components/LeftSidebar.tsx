import { useState } from 'react';
import { MODES, type Mode, type Opponent } from '../game';
import type { ModalKind } from './Modal';

interface Props {
  opponent: Opponent;
  mode: Mode;
  onStart: (opponent: Opponent, mode: Mode) => void;
  onOpen: (modal: ModalKind) => void;
}

const SECTIONS: { id: Opponent; label: string }[] = [
  { id: 'online', label: 'Play online' },
  { id: 'bot', label: 'Play with bots' },
];

export default function LeftSidebar({ opponent, mode, onStart, onOpen }: Props) {
  const [expanded, setExpanded] = useState<Opponent | null>('bot');

  return (
    <aside className="sidebar sidebar-left">
      <header className="brand">
        <h1>Buul</h1>
        <p>The Mayan board game</p>
      </header>
      <hr className="rule" />

      <nav className="menu">
        {SECTIONS.map((section) => {
          const open = expanded === section.id;
          return (
            <div key={section.id} className="dropdown">
              <button
                className="pill-button dropdown-toggle"
                aria-expanded={open}
                onClick={() => setExpanded(open ? null : section.id)}
              >
                <span className={`caret${open ? ' caret-open' : ''}`} aria-hidden="true" />
                {section.label}
              </button>
              {open &&
                MODES.map((m) => (
                  <button
                    key={m.id}
                    className={`mode-card${opponent === section.id && mode === m.id ? ' mode-card-active' : ''}`}
                    onClick={() => onStart(section.id, m.id)}
                  >
                    <span className="mode-name">{m.name}</span>
                    <span className="mode-blurb">{m.blurb}</span>
                  </button>
                ))}
            </div>
          );
        })}
        <button className="pill-button" onClick={() => onOpen('learn')}>
          Learn
        </button>
      </nav>

      <div className="menu menu-bottom">
        <button className="pill-button" onClick={() => onOpen('account')}>
          Account
        </button>
        <button className="pill-button" onClick={() => onOpen('about')}>
          About us
        </button>
      </div>
    </aside>
  );
}
