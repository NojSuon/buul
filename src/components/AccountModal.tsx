import { useEffect, useState } from 'react';
import { useAccount } from '../account';
import { MODES } from '../game';
import { useStrings } from '../i18n';
import Modal from './Modal';

const NICKNAME_MIN = 2;
const NICKNAME_MAX = 20;

export default function AccountModal({ onClose, onOpenPrivacy }: { onClose: () => void; onOpenPrivacy: () => void }) {
  const t = useStrings().account;
  const account = useAccount();
  const [nickname, setNickname] = useState(account.profile?.nickname ?? '');
  const [saved, setSaved] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => setNickname(account.profile?.nickname ?? ''), [account.profile?.nickname]);

  const trimmed = nickname.trim();
  const nicknameValid = trimmed.length >= NICKNAME_MIN && trimmed.length <= NICKNAME_MAX;

  const saveNickname = async () => {
    await account.rename(trimmed);
    setSaved(true);
  };

  return (
    <Modal title={t.title} onClose={onClose} className="modal-account">
      <div className="modal-body account-body">
        {account.status === 'loading' && <p>{t.loading}</p>}

        {account.status === 'signedOut' && (
          <>
            <p>{t.intro}</p>
            <button className="google-button" onClick={account.signIn} disabled={account.busy}>
              <span className="google-mark" aria-hidden="true">G</span>
              {t.signIn}
            </button>
            <p className="settings-hint">{t.ageNote}</p>
          </>
        )}

        {account.status === 'signedIn' && account.profile && (
          <>
            <label className="account-field">
              <span className="account-label">{t.nickname}</span>
              <span className="account-row">
                <input
                  value={nickname}
                  maxLength={NICKNAME_MAX}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setSaved(false);
                  }}
                />
                <button
                  className="pill-button account-save"
                  onClick={saveNickname}
                  disabled={!nicknameValid || trimmed === account.profile.nickname || account.busy}
                >
                  {saved ? t.saved : t.save}
                </button>
              </span>
              <span className="settings-hint">{t.nicknameHint}</span>
            </label>

            <div>
              <h3>{t.stats}</h3>
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>{t.mode}</th>
                    <th>{t.played}</th>
                    <th>{t.won}</th>
                  </tr>
                </thead>
                <tbody>
                  {MODES.map((m) => (
                    <tr key={m.id}>
                      <td>{m.name}</td>
                      <td>{account.profile!.stats[m.id].played}</td>
                      <td>{account.profile!.stats[m.id].won}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {confirmingDelete ? (
              <div className="delete-confirm">
                <p>{t.deleteConfirm}</p>
                <div className="account-row">
                  <button className="pill-button danger-button" onClick={account.deleteAccount} disabled={account.busy}>
                    {t.deleteYes}
                  </button>
                  <button className="pill-button" onClick={() => setConfirmingDelete(false)}>
                    {t.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <div className="account-row">
                <button className="pill-button" onClick={account.signOut} disabled={account.busy}>
                  {t.signOut}
                </button>
                <button className="pill-button danger-outline" onClick={() => setConfirmingDelete(true)}>
                  {t.deleteAccount}
                </button>
              </div>
            )}
          </>
        )}

        {account.status === 'signedIn' && !account.profile && (
          <>
            <p>{t.profileFailed}</p>
            <div className="account-row">
              <button className="pill-button" onClick={account.reloadProfile} disabled={account.busy}>
                {t.retry}
              </button>
              <button className="pill-button" onClick={account.signOut} disabled={account.busy}>
                {t.signOut}
              </button>
            </div>
          </>
        )}

        {account.error && (
          <p className="account-error">
            {t.errors[account.error]}
            {account.errorCode && <span className="account-error-code">({account.errorCode})</span>}
          </p>
        )}

        <button className="link-button" onClick={onOpenPrivacy}>
          {t.privacyLink}
        </button>
      </div>
    </Modal>
  );
}
