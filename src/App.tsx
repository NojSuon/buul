import { useEffect, useReducer, useState } from 'react';
import {
  applyRoll,
  legalMoves,
  movePiece,
  newGame,
  throwDice,
  type GameState,
  type Mode,
  type Opponent,
} from './game';
import LeftSidebar from './components/LeftSidebar';
import GameArea from './components/GameArea';
import MoveHistory from './components/MoveHistory';
import InfoModal from './components/InfoModal';
import LearnModal from './components/LearnModal';
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

export default function App() {
  const [opponent, setOpponent] = useState<Opponent>('bot');
  const [game, dispatch] = useReducer(reducer, 'race', newGame);
  const [gameId, setGameId] = useState(makeGameId);
  const [modal, setModal] = useState<ModalKind | null>(null);
  const scale = useFitScale();

  // The bot always plays B: roll, then pick one of its legal pieces at random.
  useEffect(() => {
    if (opponent !== 'bot' || game.turn !== 'B' || game.winner) return;
    const timer = setTimeout(() => {
      if (game.roll === null) {
        dispatch({ type: 'roll', dice: throwDice() });
      } else {
        const options = legalMoves(game);
        const choice = options[Math.floor(Math.random() * options.length)];
        if (choice) dispatch({ type: 'move', pieceId: choice.id });
      }
    }, BOT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [opponent, game]);

  const startGame = (nextOpponent: Opponent, mode: Mode) => {
    setOpponent(nextOpponent);
    setGameId(makeGameId());
    dispatch({ type: 'new', mode });
  };

  return (
    <div
      className="app"
      style={{
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        transform: `translate(-50%, -50%) scale(${scale})`,
      }}
    >
      <LeftSidebar
        opponent={opponent}
        mode={game.mode}
        onStart={startGame}
        onOpen={setModal}
      />
      <GameArea
        game={game}
        opponent={opponent}
        onRoll={() => dispatch({ type: 'roll', dice: throwDice() })}
        onMove={(pieceId) => dispatch({ type: 'move', pieceId })}
      />
      <MoveHistory gameId={gameId} moves={game.moves} />
      {modal === 'learn' && <LearnModal onClose={() => setModal(null)} />}
      {(modal === 'account' || modal === 'about') && <InfoModal kind={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
