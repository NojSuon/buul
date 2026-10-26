import { useState, type FormEvent } from 'react';
import { useAccount } from '../account';
import { MODES, type Mode } from '../game';
import { useStrings } from '../i18n';
import { suggestNickname } from '../nickname';
import { formatCode, inviteLink, toOnlineError, type OnlineError, type useOnlineGame } from '../online';
import Modal from './Modal';
import NicknameForm from './NicknameForm';

export type OnlineIntent = { kind: 'create'; mode: Mode } | { kind: 'join'; code?: string };

type Problem = OnlineError | 'bad-code';

interface Props {
  intent: OnlineIntent;
  online: ReturnType<typeof useOnlineGame>;
  onClose: () => void;
  onOpenAccount: () => void;
  onCancelGame: () => void;
}

// Guests' last nickname is remembered in this browser, so they don't retype it every game.
const GUEST_NAME_KEY = 'buul.guestName';

function storedGuestName() {
  try {
    return localStorage.getItem(GUEST_NAME_KEY);
  } catch {
    return null;
  }
}

function storeGuestName(name: string) {
  try {
    localStorage.setItem(GUEST_NAME_KEY, name);
  } catch {
    // Only a convenience.
  }
}

export default function OnlineModal({ intent, online, onClose, onOpenAccount, onCancelGame }: Props) {
  const t = useStrings();
  const o = t.online;
  const account = useAccount();
  const [code, setCode] = useState(intent.kind === 'join' ? intent.code ?? '' : '');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [copied, setCopied] = useState(false);
  const [guestName] = useState(() => storedGuestName() ?? suggestNickname());

  const waiting = online.session?.side === 'A' && online.game?.status === 'waiting';
  const modeName = intent.kind === 'create' ? MODES.find((m) => m.id === intent.mode)!.name : '';
  const submitLabel = intent.kind === 'create' ? o.create : o.join;

  // Creates or joins the game as `nickname`, signing in as a guest first if needed.
  const go = async (nickname: string) => {
    const digits = code.replace(/\D/g, '');
    if (intent.kind === 'join' && digits.length !== 6) return setProblem('bad-code');
    setBusy(true);
    setProblem(null);
    try {
      const uid = account.uid ?? (await account.signInAsGuest());
      if (account.status !== 'signedIn') storeGuestName(nickname);
      if (online.session) await online.leave();
      if (intent.kind === 'create') {
        await online.create(intent.mode, uid, nickname);
      } else {
        const result = await online.join(digits, uid, nickname);
        if ('error' in result) setProblem(result.error);
      }
    } catch (e) {
      setProblem(toOnlineError(e));
    } finally {
      setBusy(false);
    }
  };

  const link = online.session ? inviteLink(online.session.code) : '';
  const copyLink = () => navigator.clipboard?.writeText(link).then(() => setCopied(true), () => {});
  const shareLink = () => navigator.share?.({ title: 'Buul', text: o.shareText, url: link }).catch(() => {});

  if (waiting) {
    return (
      <Modal title={o.waitingTitle} onClose={onClose} className="modal-account">
        <div className="modal-body account-body">
          <p>{o.share}</p>
          <div className="online-code" aria-label={o.codeLabel}>
            {formatCode(online.session!.code)}
          </div>
          <input className="online-link" value={link} readOnly onFocus={(e) => e.target.select()} aria-label={o.inviteLabel} />
          <div className="account-row">
            <button className="pill-button victory-primary online-primary" onClick={copyLink}>
              {copied ? o.copied : o.copyLink}
            </button>
            {'share' in navigator && (
              <button className="pill-button" onClick={shareLink}>
                {o.shareButton}
              </button>
            )}
          </div>
          <p className="online-waiting">{o.waiting}</p>
          <button className="link-button" onClick={onCancelGame}>
            {o.cancel}
          </button>
        </div>
      </Modal>
    );
  }

  const title = intent.kind === 'create' ? o.createTitle(modeName) : o.joinTitle;

  return (
    <Modal title={title} onClose={onClose} className="modal-account">
      <div className="modal-body account-body">
        {intent.kind === 'join' && (
          <label className="account-field">
            <span className="account-label">{o.codeLabel}</span>
            <input
              className="online-code-input"
              value={code}
              inputMode="numeric"
              autoComplete="off"
              placeholder="123-456"
              maxLength={7}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>
        )}

        {account.status === 'loading' && <p>{t.account.loading}</p>}

        {account.status === 'needsNickname' && (
          <>
            <p>{o.needsNickname}</p>
            <button className="pill-button" onClick={onOpenAccount}>
              {o.openAccount}
            </button>
          </>
        )}

        {account.status === 'signedIn' && account.profile && (
          <form
            className="account-field"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              go(account.profile!.nickname);
            }}
          >
            <p>{o.playingAs(account.profile.nickname)}</p>
            <button type="submit" className="pill-button victory-primary online-primary" disabled={busy}>
              {busy ? o.connecting : submitLabel}
            </button>
          </form>
        )}

        {(account.status === 'signedOut' || account.status === 'guest') && (
          <>
            <p>{o.guestIntro}</p>
            <NicknameForm initial={guestName} submitLabel={busy ? o.connecting : submitLabel} busy={busy} suggest onSubmit={go} />
            <button className="link-button" onClick={account.signIn} disabled={account.busy}>
              {o.orSignIn}
            </button>
          </>
        )}

        {problem && <p className="account-error">{o.errors[problem]}</p>}

        <p className="settings-hint">{o.trust}</p>
      </div>
    </Modal>
  );
}
