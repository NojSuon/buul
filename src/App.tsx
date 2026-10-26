import { useEffect, useReducer, useState } from 'react';
import {
  applyRoll,
  movePiece,
  newGame,
  throwDice,
  type GameState,
  type Mode,
  type Opponent,
} from './game';
import { BOTS, chooseMove, randomBot, type Bot } from './bots';
import { LanguageProvider, type Lang } from './i18n';
import LeftSidebar from './components/LeftSidebar';
import GameArea from './components/GameArea';
import MoveHistory from './components/MoveHistory';
import InfoModal from './components/InfoModal';
import LearnModal from './components/LearnModal';
import SettingsModal, { type BotChoice } from './components/SettingsModal';
import type { ModalKind } from './components/Modal';

type Action =
  | { type: 'roll'; dice: boolean[] }
  | { type: 'move'; pieceId: string }
  | { type: 'new'; mode: Mode };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'roll':
      return applyRoll(state, action.dice);
    case 'move':
      return movePiece(state, action.pieceId);
    case 'new':
      return newGame(action.mode);
  }
}

const makeGameId = () => {
  const n = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');
  return `${n.slice(0, 3)}-${n.slice(3)}`;
};

const BOT_DELAY_MS = 700;

// The layout is designed at this size and scaled to fit the window, so it looks the same at any
// resolution or browser zoom.
const STAGE_WIDTH = 1400;
const STAGE_HEIGHT = 760;

function useFitScale() {
  const fit = () => Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT);
  const [scale, setScale] = useState(fit);
  useEffect(() => {
    // Fires on window resizes and browser zoom alike.
    const observer = new ResizeObserver(() => setScale(fit()));
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, []);
  return scale;
}

// A setting remembered in this browser; falls back to the default if storage is unavailable.
function useStoredSetting<T extends string>(key: string, fallback: T, allowed: readonly T[]) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key) as T | null;
      return stored && allowed.includes(stored) ? stored : fallback;
    } catch {
      return fallback;
    }
  });
  const update = (next: T) => {
    setValue(next);
    try {
      localStorage.setItem(key, next);
    } catch {
      // Not remembered, but still applied for this visit.
    }
  };
  return [value, update] as const;
}

const pickBot = (choice: BotChoice): Bot => BOTS.find((b) => b.id === choice) ?? randomBot();

export default function App() {
  const [lang, setLang] = useStoredSetting<Lang>('buul.lang', 'en', ['en', 'es']);
  const [botChoice, setBotChoice] = useStoredSetting<BotChoice>('buul.bot', 'random', [
    'random',
    ...BOTS.map((b) => b.id),
  ]);
  const [opponent, setOpponent] = useState<Opponent>('bot');
  const [bot, setBot] = useState(() => pickBot(botChoice));
  const [game, dispatch] = useReducer(reducer, 'race', newGame);
  const [gameId, setGameId] = useState(makeGameId);
  const [modal, setModal] = useState<ModalKind | null>(null);
  const scale = useFitScale();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // The bot always plays B: it rolls, then picks a piece according to its personality.
  useEffect(() => {
    if (opponent !== 'bot' || game.turn !== 'B' || game.winner) return;
    const timer = setTimeout(() => {
      if (game.roll === null) {
        dispatch({ type: 'roll', dice: throwDice() });
      } else {
        const pieceId = chooseMove(game, bot.personality);
        if (pieceId) dispatch({ type: 'move', pieceId });
      }
    }, BOT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [opponent, game, bot]);

  const startGame = (nextOpponent: Opponent, mode: Mode) => {
    setOpponent(nextOpponent);
    if (nextOpponent === 'bot') setBot(pickBot(botChoice));
    setGameId(makeGameId());
    dispatch({ type: 'new', mode });
  };

  // A specific bot takes over the current game right away; "random" applies from the next game.
  const changeBotChoice = (choice: BotChoice) => {
    setBotChoice(choice);
    if (choice !== 'random') setBot(pickBot(choice));
  };

  const closeModal = () => setModal(null);

  return (
    <LanguageProvider lang={lang}>
      <div
        className="app"
        style={{
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <LeftSidebar opponent={opponent} mode={game.mode} onStart={startGame} onOpen={setModal} />
        <GameArea
          game={game}
          bot={opponent === 'bot' ? bot : null}
          onRoll={() => dispatch({ type: 'roll', dice: throwDice() })}
          onMove={(pieceId) => dispatch({ type: 'move', pieceId })}
        />
        <MoveHistory gameId={gameId} moves={game.moves} />
        {modal === 'learn' && <LearnModal onClose={closeModal} />}
        {modal === 'settings' && (
          <SettingsModal
            lang={lang}
            botChoice={botChoice}
            onLangChange={setLang}
            onBotChoiceChange={changeBotChoice}
            onClose={closeModal}
          />
        )}
        {(modal === 'account' || modal === 'about') && <InfoModal kind={modal} onClose={closeModal} />}
      </div>
    </LanguageProvider>
  );
}
