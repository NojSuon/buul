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
          After rolling, click one of your highlighted pieces. Each team can have only one piece per
          column, apart from the home columns A and K where pieces start.
        </p>
        <h3>Capturing</h3>
        <p>
          Move into a column that holds an enemy piece and you capture it, whatever row it is on.
          Pieces in their own home column are safe.
        </p>
        <h3>Game modes</h3>
        <p>
          <strong>Ixi’im Beel</strong> (maize race): a piece is crowned only when it lands exactly
          on the last column, and it moves to your crowned pieces. If the roll takes it past the
          end, it goes back to its start; for example, a piece on column I needs exactly 2. A
          captured piece also goes back to its start. The first to crown all five pieces wins.
        </p>
        <p>
          <strong>Noj Ba’atel</strong> (capture mode): a piece that reaches the last column or
          runs past it goes back to its base and keeps playing, and a captured piece is out of the
          game. The first to
          capture all five enemy pieces wins.
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
