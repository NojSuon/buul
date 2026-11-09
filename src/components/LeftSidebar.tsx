import { useState } from 'react';
import { MODES, type Mode, type Opponent } from '../game';
import { useStrings } from '../i18n';
import type { ModalKind } from './Modal';

export type Theme = 'light' | 'dark';

interface Props {
  opponent: Opponent;
  mode: Mode;
  // Picking a mode under "Play online" creates an online game; under "Play with bots", a bot game.
  onStart: (opponent: Opponent, mode: Mode) => void;
  onJoin: () => void;
  onOpen: (modal: ModalKind) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

// Switches between light and dark; the label names the mode it switches to.
export function ThemeButton({ theme, onToggle, compact }: { theme: Theme; onToggle: () => void; compact?: boolean }) {
  const t = useStrings();
  const label = theme === 'dark' ? t.nav.lightMode : t.nav.darkMode;
  const icon = theme === 'dark' ? '☀' : '☾';
  if (compact) {
    return (
      <button className="menu-button" onClick={onToggle} aria-label={label} title={label}>
        <span aria-hidden="true">{icon}</span>
      </button>
    );
  }
  return (
    <button className="pill-button" onClick={onToggle}>
      <span aria-hidden="true">{icon}</span>
      {label}
    </button>
  );
}

export default function LeftSidebar({ opponent, mode, onStart, onJoin, onOpen, theme, onToggleTheme }: Props) {
  const t = useStrings();
  const [expanded, setExpanded] = useState<Opponent | null>('bot');
  const sections: { id: Opponent; label: string }[] = [
    { id: 'online', label: t.nav.playOnline },
    { id: 'bot', label: t.nav.playBots },
  ];

  return (
    <aside className="sidebar sidebar-left">
      <header className="brand">
        <h1>Buul</h1>
        <p>{t.subtitle}</p>
      </header>
      <hr className="rule" />

      <nav className="menu">
        {sections.map((section) => {
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
                    <span className="mode-blurb">{t.modeBlurbs[m.id]}</span>
                  </button>
                ))}
              {open && section.id === 'online' && (
                <button className="mode-card join-card" onClick={onJoin}>
                  <span className="mode-name">{t.nav.joinGame}</span>
                </button>
              )}
            </div>
          );
        })}
        <button className="pill-button" onClick={() => onOpen('learn')}>
          {t.nav.learn}
        </button>
      </nav>

      <div className="menu menu-bottom">
        <ThemeButton theme={theme} onToggle={onToggleTheme} />
        <button className="pill-button" onClick={() => onOpen('settings')}>
          {t.nav.settings}
        </button>
        <button className="pill-button" onClick={() => onOpen('account')}>
          {t.nav.account}
        </button>
        <button className="pill-button" onClick={() => onOpen('about')}>
          {t.nav.aboutUs}
        </button>
      </div>
    </aside>
  );
}
