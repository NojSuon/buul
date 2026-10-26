import type { ReactNode } from 'react';
import Modal from './Modal';
import matiMatiLogo from '../assets/mati-mati-logo.png';

type InfoKind = 'account' | 'about';

const CONTENT: Record<InfoKind, { title: string; body: ReactNode }> = {
  account: {
    title: 'Account',
    body: <p>Accounts are coming soon. You’ll be able to save games and invite friends to play online.</p>,
  },
  about: {
    title: 'About us',
    body: (
      <>
        <img className="about-logo" src={matiMatiLogo} alt="Mati Mati" />
        <p>
          Welcome! We are <strong>Mati Mati</strong>, a community dedicated to teaching, researching
          and gathering resources about minority communities around the world.
        </p>
        <p>
          This digital edition of Buul is part of that work: a way to share a traditional Maya game
          with anyone who would like to learn it and play.
        </p>
        <p>We would be delighted to hear from you. You can write to us or follow our work here:</p>
        <ul className="about-links">
          <li>
            <span>Email</span>
            <a href="mailto:matimati.info@gmail.com">matimati.info@gmail.com</a>
          </li>
          <li>
            <span>Instagram</span>
            <a href="https://www.instagram.com/matidemati" target="_blank" rel="noopener noreferrer">
              @matidemati
            </a>
          </li>
          <li>
            <span>Reddit</span>
            <a href="https://www.reddit.com/r/mati_mati" target="_blank" rel="noopener noreferrer">
              r/mati_mati
            </a>
          </li>
        </ul>
      </>
    ),
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
