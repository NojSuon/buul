import { useEffect, type ReactNode } from 'react';

export type ModalKind = 'learn' | 'account' | 'about';

const CONTENT: Record<ModalKind, { title: string; body: ReactNode }> = {
  learn: {
    title: 'Learn to play Buul',
    body: (
      <>
        <p>
          Buul is a race game played by the Maya. Each player leads five pieces across a board of
          11 columns and 5 rows, from their own side to the opponent’s.
        </p>
        <h3>Rolling</h3>
        <p>
          Press <strong>Roll</strong> to throw four two-faced dice. You move as many steps as there
          are marked faces. If no face is marked, you move 5.
        </p>
        <h3>Moving</h3>
        <p>
          After rolling, click one of your highlighted pieces. A piece that runs past the far edge
          is crowned and leaves the board.
        </p>
        <h3>Game modes</h3>
        <p>
          <strong>Ixi’im Beel</strong> (maize race): you can’t land on an occupied square. Crown
          your troops before your opponent does.
        </p>
        <p>
          <strong>Noj Ba’atel</strong> (capture mode): landing on an enemy piece captures it.
          Captures and crowns both count toward victory.
        </p>
      </>
    ),
  },
  account: {
    title: 'Account',
    body: <p>Accounts are coming soon. You’ll be able to save games and invite friends to play online.</p>,
  },
  about: {
    title: 'About us',
    body: <p>Buul brings a traditional Mesoamerican Maya board game to the browser, so anyone can learn it and play.</p>,
  },
};

interface Props {
  kind: ModalKind;
  onClose: () => void;
}

export default function InfoModal({ kind, onClose }: Props) {
  const { title, body } = CONTENT[kind];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="modal-title">{title}</h2>
        <div className="modal-body">{body}</div>
        <button className="pill-button modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
