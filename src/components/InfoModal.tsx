import type { ReactNode } from 'react';
import Modal from './Modal';

type InfoKind = 'account' | 'about';

const CONTENT: Record<InfoKind, { title: string; body: ReactNode }> = {
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
  kind: InfoKind;
  onClose: () => void;
}

export default function InfoModal({ kind, onClose }: Props) {
  const { title, body } = CONTENT[kind];
  return (
    <Modal title={title} onClose={onClose}>
      <div className="modal-body">{body}</div>
    </Modal>
  );
}
