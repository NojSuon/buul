import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  applyRoll,
  movePiece,
  newGame,
  throwDice,
  type GameState,
  type Mode,
  type Opponent,
  type Player,
} from './game';
import { BOTS, chooseMove, randomBot, type Bot } from './bots';
import { LanguageProvider, stringsFor, type Lang } from './i18n';
import LeftSidebar from './components/LeftSidebar';
import MobileBar from './components/MobileBar';
import DebugInfo from './components/DebugInfo';
import GameArea, { type BoardNotice, type Seat } from './components/GameArea';
import MoveHistory from './components/MoveHistory';
import InfoModal from './components/InfoModal';
import AccountModal from './components/AccountModal';
import PrivacyModal from './components/PrivacyModal';
import OnlineModal, { type OnlineIntent } from './components/OnlineModal';
import { useAccount } from './account';
import { PIECE_COLOR_IDS, colorVariables, resolveColors, type PieceColor } from './colors';
import { formatCode, useOnlineGame } from './online';
import LearnModal from './components/LearnModal';
import SettingsModal, { type BotChoice, type SoundSetting } from './components/SettingsModal';
import type { ModalKind } from './components/Modal';
import yourTurnSound from './assets/sounds/message-sent.wav';
import opponentTurnSound from './assets/sounds/message-receive.wav';

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

// Upright screens narrower than a desktop (phones, tablets held vertically) get the phone layout;
// everything else gets the desktop stage, scaled to fit.
function measureViewport() {
  const { innerWidth: w, innerHeight: h } = window;
  return { mobile: h > w && w < 1000, scale: Math.min(w / STAGE_WIDTH, h / STAGE_HEIGHT) };
}

function useViewport() {
  const [viewport, setViewport] = useState(measureViewport);
  useEffect(() => {
    // Fires on window resizes, rotation and browser zoom alike.
    const observer = new ResizeObserver(() => setViewport(measureViewport()));
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, []);
  return viewport;
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

// Plays "message sent" when the turn passes to the person at this screen and "message received"
// when it passes to their opponent.
function useTurnSounds(game: GameState, seats: Record<Player, Seat>, enabled: boolean) {
  const sounds = useMemo(() => ({ mine: new Audio(yourTurnSound), theirs: new Audio(opponentTurnSound) }), []);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!enabled || game.winner) return;
    const sound = seats[game.turn].kind === 'me' ? sounds.mine : sounds.theirs;
    sound.currentTime = 0;
    // Browsers may block sound until the page has been clicked; that's fine to ignore.
    sound.play().catch(() => {});
  }, [game.turn]); // only a change of turn plays a sound
}

export default function App() {
  const [lang, setLang] = useStoredSetting<Lang>('buul.lang', 'en', ['en', 'es']);
  const [botChoice, setBotChoice] = useStoredSetting<BotChoice>('buul.bot', 'random', [
    'random',
    ...BOTS.map((b) => b.id),
  ]);
  const [sound, setSound] = useStoredSetting<SoundSetting>('buul.sound', 'on', ['on', 'off']);
  const [myColor, setMyColor] = useStoredSetting<PieceColor>('buul.color', 'turquoise', PIECE_COLOR_IDS);
  const [bot, setBot] = useState(() => pickBot(botChoice));
  const [localGame, dispatch] = useReducer(reducer, 'race', newGame);
  const [gameId, setGameId] = useState(makeGameId);
  const [modal, setModal] = useState<ModalKind | null>(null);
  const [onlineIntent, setOnlineIntent] = useState<OnlineIntent>({ kind: 'create', mode: 'race' });
  const { mobile, scale } = useViewport();
  const [menuOpen, setMenuOpen] = useState(false);
  const t = stringsFor(lang);

  const account = useAccount();
  const online = useOnlineGame(account.uid);
  const onlineGame = online.game;
  const mySide = online.session?.side ?? null;
  const inOnline = online.session !== null;
  const opponent: Opponent = inOnline ? 'online' : 'bot';

  // While an online game is loading, an empty board stands in for it.
  const placeholder = useMemo(() => newGame('race'), []);
  const game = inOnline ? onlineGame?.state ?? placeholder : localGame;
  const locked = inOnline && onlineGame?.status !== 'playing';

  const seats: Record<Player, Seat> = inOnline
    ? {
        A: { kind: mySide === 'A' ? 'me' : 'remote', name: onlineGame?.players.A.nickname },
        B: { kind: mySide === 'B' ? 'me' : 'remote', name: onlineGame?.players.B?.nickname },
      }
    : {
        A: { kind: 'me', name: account.profile?.nickname },
        B: { kind: 'bot', name: bot.name, bot },
      };

  // Against a bot you play A and the bot keeps orange unless you picked it.
  const colors = inOnline && mySide
    ? resolveColors(myColor, mySide, onlineGame?.players[mySide === 'A' ? 'B' : 'A']?.color)
    : resolveColors(myColor, 'A', undefined);

  useTurnSounds(game, seats, sound === 'on');

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // An invite link (?join=123456) opens the join popup with the code filled in.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('join');
    if (!code) return;
    params.delete('join');
    const rest = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (rest ? `?${rest}` : ''));
    setOnlineIntent({ kind: 'join', code });
    setModal('online');
  }, []);

  // The online popup closes by itself once the friend has joined.
  useEffect(() => {
    if (modal === 'online' && onlineGame?.status === 'playing') setModal(null);
  }, [onlineGame?.status]);

  // A signed-in player's statistics count games against bots, where they always play A.
  useEffect(() => {
    if (game.winner && !inOnline) account.recordGame(game.mode, game.winner === 'A');
  }, [game.winner]); // only the end of a game is recorded

  // The bot always plays B: it rolls, then picks a piece according to its personality.
  useEffect(() => {
    if (inOnline || game.turn !== 'B' || game.winner) return;
    const timer = setTimeout(() => {
      if (game.roll === null) {
        dispatch({ type: 'roll', dice: throwDice() });
      } else {
        const pieceId = chooseMove(game, bot.personality);
        if (pieceId) dispatch({ type: 'move', pieceId });
      }
    }, BOT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [inOnline, game, bot]);

  // Online, a move is worked out here and saved for both players; against a bot it stays local.
  const act = (action: Action) => {
    if (!inOnline) return dispatch(action);
    if (!onlineGame || onlineGame.status !== 'playing') return;
    const next = reducer(onlineGame.state, action);
    if (next !== onlineGame.state) online.saveState(next).catch(() => {});
  };

  const startBotGame = (mode: Mode) => {
    if (inOnline) online.leave();
    setBot(pickBot(botChoice));
    setGameId(makeGameId());
    dispatch({ type: 'new', mode });
  };

  const startGame = (nextOpponent: Opponent, mode: Mode) => {
    if (nextOpponent === 'bot') return startBotGame(mode);
    setOnlineIntent({ kind: 'create', mode });
    setModal('online');
  };

  // A specific bot takes over the current game right away; "random" applies from the next game.
  const changeBotChoice = (choice: BotChoice) => {
    setBotChoice(choice);
    if (choice !== 'random') setBot(pickBot(choice));
  };

  const closeModal = () => setModal(null);

  const opponentSide: Player | null = mySide ? (mySide === 'A' ? 'B' : 'A') : null;
  const notice: BoardNotice | null =
    inOnline && onlineGame?.status === 'left' && onlineGame.leftBy !== mySide && opponentSide
      ? {
          title: t.online.left(seats[opponentSide].name ?? t.player(opponentSide)),
          action: t.online.backToBots,
          onAction: () => startBotGame(game.mode),
        }
      : null;

  // On phones the menu lives in a slide-in drawer, which closes once something is picked.
  const sidebar = (
    <LeftSidebar
      opponent={opponent}
      mode={game.mode}
      onStart={(nextOpponent, mode) => {
        setMenuOpen(false);
        startGame(nextOpponent, mode);
      }}
      onJoin={() => {
        setMenuOpen(false);
        setOnlineIntent({ kind: 'join' });
        setModal('online');
      }}
      onOpen={(kind) => {
        setMenuOpen(false);
        setModal(kind);
      }}
    />
  );

  const content = (
    <>
      <GameArea
        game={game}
        seats={seats}
        locked={locked}
        notice={notice}
        onRoll={() => act({ type: 'roll', dice: throwDice() })}
        onMove={(pieceId) => act({ type: 'move', pieceId })}
        onPlayAgain={() => (inOnline ? act({ type: 'new', mode: game.mode }) : startBotGame(game.mode))}
      />
      <MoveHistory
        gameId={online.session ? formatCode(online.session.code) : gameId}
        moves={game.moves}
        onlineCode={online.session?.code ?? null}
        onLeave={() => startBotGame(game.mode)}
      />
      {modal === 'learn' && <LearnModal onClose={closeModal} />}
      {modal === 'settings' && (
        <SettingsModal
          lang={lang}
          botChoice={botChoice}
          sound={sound}
          color={myColor}
          onLangChange={setLang}
          onSoundChange={setSound}
          onColorChange={setMyColor}
          onBotChoiceChange={changeBotChoice}
          onClose={closeModal}
        />
      )}
      {modal === 'account' && <AccountModal onClose={closeModal} onOpenPrivacy={() => setModal('privacy')} />}
      {modal === 'about' && <InfoModal onClose={closeModal} onOpenPrivacy={() => setModal('privacy')} />}
      {modal === 'privacy' && <PrivacyModal onClose={closeModal} />}
      {modal === 'online' && (
        <OnlineModal
          intent={onlineIntent}
          online={online}
          color={myColor}
          onClose={closeModal}
          onOpenAccount={() => setModal('account')}
          onCancelGame={() => {
            online.leave();
            closeModal();
          }}
        />
      )}
    </>
  );

  const debug = new URLSearchParams(window.location.search).has('debug');

  return (
    <LanguageProvider lang={lang}>
      {debug && <DebugInfo mobile={mobile} />}
      {mobile ? (
        <div className="app app-mobile" style={colorVariables(colors)}>
          <MobileBar onMenu={() => setMenuOpen(true)} />
          {content}
          {menuOpen && (
            <div className="drawer-backdrop" onClick={() => setMenuOpen(false)}>
              <div className="drawer" onClick={(e) => e.stopPropagation()}>
                {sidebar}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className="app"
          style={{
            ...colorVariables(colors),
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            transform: `translate(-50%, -50%) scale(${scale})`,
          }}
        >
          {sidebar}
          {content}
        </div>
      )}
    </LanguageProvider>
  );
}
