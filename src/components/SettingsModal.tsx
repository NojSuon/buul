import { BOTS } from '../bots';
import { PIECE_COLORS, type PieceColor } from '../colors';
import { LANGUAGES, useStrings, type Lang } from '../i18n';
import Modal from './Modal';

export type BotChoice = 'random' | string;
export type SoundSetting = 'on' | 'off';

interface Props {
  lang: Lang;
  botChoice: BotChoice;
  sound: SoundSetting;
  color: PieceColor;
  onLangChange: (lang: Lang) => void;
  onColorChange: (color: PieceColor) => void;
  onBotChoiceChange: (choice: BotChoice) => void;
  onSoundChange: (sound: SoundSetting) => void;
  onClose: () => void;
}

export default function SettingsModal({
  lang,
  botChoice,
  sound,
  color,
  onLangChange,
  onColorChange,
  onBotChoiceChange,
  onSoundChange,
  onClose,
}: Props) {
  const t = useStrings();
  const soundOptions: { id: SoundSetting; label: string }[] = [
    { id: 'on', label: t.settingsPanel.soundOn },
    { id: 'off', label: t.settingsPanel.soundOff },
  ];

  return (
    <Modal title={t.settingsPanel.title} onClose={onClose} className="modal-settings">
      <section className="settings-section">
        <h3>{t.settingsPanel.language}</h3>
        <div className="segmented" role="radiogroup" aria-label={t.settingsPanel.language}>
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              role="radio"
              aria-checked={lang === l.id}
              className={`tab${lang === l.id ? ' tab-active' : ''}`}
              onClick={() => onLangChange(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h3>{t.settingsPanel.sound}</h3>
        <div className="segmented" role="radiogroup" aria-label={t.settingsPanel.sound}>
          {soundOptions.map((o) => (
            <button
              key={o.id}
              role="radio"
              aria-checked={sound === o.id}
              className={`tab${sound === o.id ? ' tab-active' : ''}`}
              onClick={() => onSoundChange(o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h3>
          {t.settingsPanel.color}: {t.settingsPanel.colors[color]}
        </h3>
        <p className="settings-hint">{t.settingsPanel.colorHint}</p>
        <div className="color-grid" role="radiogroup" aria-label={t.settingsPanel.color}>
          {PIECE_COLORS.map((c) => (
            <button
              key={c.id}
              role="radio"
              aria-checked={color === c.id}
              aria-label={t.settingsPanel.colors[c.id]}
              title={t.settingsPanel.colors[c.id]}
              className={`color-option${color === c.id ? ' color-option-active' : ''}`}
              style={{ background: c.hex }}
              onClick={() => onColorChange(c.id)}
            />
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h3>{t.settingsPanel.opponent}</h3>
        <p className="settings-hint">{t.settingsPanel.opponentHint}</p>
        <div className="bot-grid" role="radiogroup" aria-label={t.settingsPanel.opponent}>
          <button
            role="radio"
            aria-checked={botChoice === 'random'}
            className={`bot-card${botChoice === 'random' ? ' bot-card-active' : ''}`}
            onClick={() => onBotChoiceChange('random')}
          >
            <span className="bot-card-name">{t.settingsPanel.random}</span>
            <span className="bot-card-hint">{t.settingsPanel.randomHint}</span>
          </button>
          {BOTS.map((bot) => (
            <button
              key={bot.id}
              role="radio"
              aria-checked={botChoice === bot.id}
              className={`bot-card${botChoice === bot.id ? ' bot-card-active' : ''}`}
              onClick={() => onBotChoiceChange(bot.id)}
            >
              <span className="bot-card-name">{bot.name}</span>
              <span className={`bot-tag bot-tag-${bot.personality}`}>{t.personality[bot.personality]}</span>
              <span className="bot-card-hint">{t.personalityHint[bot.personality]}</span>
            </button>
          ))}
        </div>
      </section>
    </Modal>
  );
}
