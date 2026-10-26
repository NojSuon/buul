import { BOTS } from '../bots';
import { LANGUAGES, useStrings, type Lang } from '../i18n';
import Modal from './Modal';

export type BotChoice = 'random' | string;

interface Props {
  lang: Lang;
  botChoice: BotChoice;
  onLangChange: (lang: Lang) => void;
  onBotChoiceChange: (choice: BotChoice) => void;
  onClose: () => void;
}

export default function SettingsModal({ lang, botChoice, onLangChange, onBotChoiceChange, onClose }: Props) {
  const t = useStrings();

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
