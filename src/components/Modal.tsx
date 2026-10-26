import { useEffect, type ReactNode } from 'react';

import { useStrings } from '../i18n';

export type ModalKind = 'learn' | 'settings' | 'account' | 'about' | 'privacy';

interface Props {
  title: string;
  onClose: () => void;
  className?: string;
  children: ReactNode;
}

export default function Modal({ title, onClose, className, children }: Props) {
  const t = useStrings();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal${className ? ` ${className}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title">{title}</h2>
        {children}
        <button className="pill-button modal-close" onClick={onClose}>
          {t.close}
        </button>
      </div>
    </div>
  );
}
