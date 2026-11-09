import { useStrings } from '../i18n';
import { ThemeButton, type Theme } from './LeftSidebar';

interface Props {
  onMenu: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

// The phone layout's top bar: the game's name, the dark mode switch and a button that opens the
// menu drawer.
export default function MobileBar({ onMenu, theme, onToggleTheme }: Props) {
  const t = useStrings();
  return (
    <header className="mobile-bar">
      <div className="mobile-brand">
        <span className="mobile-title">Buul</span>
        <span className="mobile-subtitle">{t.subtitle}</span>
      </div>
      <div className="mobile-actions">
        <ThemeButton theme={theme} onToggle={onToggleTheme} compact />
        <button className="menu-button" onClick={onMenu} aria-label={t.menu}>
          <span aria-hidden="true">☰</span>
        </button>
      </div>
    </header>
  );
}
