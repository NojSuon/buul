import { useStrings } from '../i18n';
import Modal from './Modal';
import matiMatiLogo from '../assets/mati-mati-logo.png';

interface Props {
  kind: 'account' | 'about';
  onClose: () => void;
}

export default function InfoModal({ kind, onClose }: Props) {
  const t = useStrings();

  if (kind === 'account') {
    return (
      <Modal title={t.account.title} onClose={onClose}>
        <div className="modal-body">
          <p>{t.account.body}</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={t.about.title} onClose={onClose}>
      <div className="modal-body">
        <img className="about-logo" src={matiMatiLogo} alt="Mati Mati" />
        <p>{t.about.intro}</p>
        <p>{t.about.buul}</p>
        <p>{t.about.contact}</p>
        <ul className="about-links">
          <li>
            <span>{t.about.email}</span>
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
      </div>
    </Modal>
  );
}
