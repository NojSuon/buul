import { useStrings } from '../i18n';
import Modal from './Modal';

export default function PrivacyModal({ onClose }: { onClose: () => void }) {
  const t = useStrings().privacy;
  return (
    <Modal title={t.title} onClose={onClose} className="modal-learn">
      <div className="modal-body learn-body">{t.body}</div>
    </Modal>
  );
}
