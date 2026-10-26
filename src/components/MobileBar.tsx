import { useStrings } from '../i18n';

// The phone layout's top bar: the game's name and a button that opens the menu drawer.
export default function MobileBar({ onMenu }: { onMenu: () => void }) {
  const t = useStrings();
  return (
    <header className="mobile-bar">
      <div className="mobile-brand">
        <span className="mobile-title">Buul</span>
        <span className="mobile-subtitle">{t.subtitle}</span>
      </div>
      <button className="menu-button" onClick={onMenu} aria-label={t.menu}>
        <span aria-hidden="true">☰</span>
      </button>
    </header>
  );
}
