import { useEffect, useState, type FormEvent } from 'react';
import { useStrings } from '../i18n';
import { NICKNAME_MAX, nicknameProblem, suggestNickname } from '../nickname';

interface Props {
  initial: string;
  submitLabel: string;
  busy: boolean;
  // Offer a dice button that suggests a nickname (used when creating one).
  suggest?: boolean;
  onSubmit: (nickname: string) => Promise<void>;
}

// A nickname box that explains what's wrong as the player types (too short, odd characters,
// offensive words) and only lets valid nicknames through.
export default function NicknameForm({ initial, submitLabel, busy, suggest, onSubmit }: Props) {
  const t = useStrings().account;
  const [nickname, setNickname] = useState(initial);
  const [saved, setSaved] = useState(false);

  useEffect(() => setNickname(initial), [initial]);

  const trimmed = nickname.trim();
  const problem = nicknameProblem(trimmed);
  const unchanged = trimmed === initial;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (problem || busy) return;
    await onSubmit(trimmed);
    setSaved(true);
  };

  return (
    <form className="account-field" onSubmit={submit}>
      <label className="account-label" htmlFor="nickname">
        {t.nickname}
      </label>
      <span className="account-row">
        <input
          id="nickname"
          value={nickname}
          maxLength={NICKNAME_MAX}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={problem !== null && !unchanged}
          aria-describedby="nickname-hint"
          onChange={(e) => {
            setNickname(e.target.value);
            setSaved(false);
          }}
        />
        {suggest && (
          <button
            type="button"
            className="pill-button dice-button"
            onClick={() => setNickname(suggestNickname())}
            title={t.suggest}
            aria-label={t.suggest}
          >
            🎲
          </button>
        )}
        <button type="submit" className="pill-button account-save" disabled={!!problem || (unchanged && !suggest) || busy}>
          {saved && unchanged && !suggest ? t.saved : submitLabel}
        </button>
      </span>
      <span id="nickname-hint" className={problem && !unchanged ? 'nickname-problem' : 'settings-hint'}>
        {problem && !unchanged ? t.nicknameProblems[problem] : t.nicknameHint}
      </span>
    </form>
  );
}
