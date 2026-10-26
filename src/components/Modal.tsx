import { useEffect, type ReactNode } from 'react';

export type ModalKind = 'learn' | 'account' | 'about';

interface Props {
  title: string;
  onClose: () => void;
  className?: string;
  children: ReactNode;
}

export default function Modal({ title, onClose, className, children }: Props) {
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
          Close
        </button>
      </div>
    </div>
  );
}
