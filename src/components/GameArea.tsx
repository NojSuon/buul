import { useEffect, useState } from 'react';
import type { Bot } from '../bots';
import { COLUMNS, ROWS, canMove, other, previewMove, type GameState, type Player } from '../game';
import { useStrings, type Strings } from '../i18n';

interface Props {
  game: GameState;
  // The bot playing B, or null when two people share the screen.
  bot: Bot | null;
  onRoll: () => void;
  onMove: (pieceId: string) => void;
  onPlayAgain: () => void;
}

const COLOR: Record<Player, string> = { A: 'teal', B: 'orange' };
const TARGET_ICON = { move: '', capture: '✕', crown: '♛', base: '↺' };

const isBotPlayer = (bot: Bot | null, player: Player) => bot !== null && player === 'B';

function statusText(t: Strings, game: GameState, player: Player, bot: Bot | null, selected: boolean): string {
  if (game.winner) {
    if (game.winner === 'draw') return t.status.draw;
    return game.winner === player ? t.status.victory : t.status.defeated;
  }
  if (game.turn !== player) return t.status.waiting;
  if (isBotPlayer(bot, player)) return t.status.thinking;
  if (game.roll === null) return t.status.yourTurn;
  return selected ? t.status.confirm : t.status.pick(game.roll);
}

function PlayerHeader({ game, player, bot, selected }: { game: GameState; player: Player; bot: Bot | null; selected: boolean }) {
  const t = useStrings();
  const playerBot = isBotPlayer(bot, player) ? bot : null;
  return (
    <div className={`player-header player-header-${player.toLowerCase()}`}>
      <div className="player-title">
        <span className={`swatch swatch-${COLOR[player]}`} aria-hidden="true" />
        <h2>{playerBot ? playerBot.name : t.player(player)}</h2>
        {playerBot && (
          <span className={`bot-tag bot-tag-${playerBot.personality}`}>{t.personality[playerBot.personality]}</span>
        )}
      </div>
      <p className="player-status">{statusText(t, game, player, bot, selected)}</p>
    </div>
  );
}

// Race mode scores crowned pieces; capture mode scores captured enemy pieces.
function CrownedBar({ game, player }: { game: GameState; player: Player }) {
  const t = useStrings();
  const race = game.mode === 'race';
  const count = race ? game.crowned[player] : game.captured[player];
  const label = race ? t.crownedPieces : t.capturedPieces;
  return (
    <div className={`crowned crowned-${player.toLowerCase()}`}>
      <span className="crowned-label">{label}</span>
      <div className={`crowned-bar bg-${COLOR[player]}`} aria-label={`${label}: ${count}`}>
        {Array.from({ length: count }, (_, i) =>
          race ? (
            <span key={i} className="crown-token">♛</span>
          ) : (
            <span key={i} className={`captured-token bg-${COLOR[other(player)]}`} />
          ),
        )}
      </div>
    </div>
  );
}

function RollControl({ game, player, bot, onRoll }: { game: GameState; player: Player; bot: Bot | null; onRoll: () => void }) {
  const t = useStrings();
  const enabled = game.turn === player && game.roll === null && !game.winner && !isBotPlayer(bot, player);
  const dice = game.dice[player] ?? [false, false, false, false];
  return (
    <div className="roll">
      <button
        className={`roll-button bg-${COLOR[player]}${enabled ? ' roll-button-ready' : ''}`}
        disabled={!enabled}
        onClick={onRoll}
      >
        {t.roll}
      </button>
      <div className="dice" aria-label={game.dice[player] ? `${dice.filter(Boolean).length}` : undefined}>
        {dice.map((marked, i) => (
          <span key={i} className={`die die-${COLOR[player]}${marked ? ' die-marked' : ''}`} />
        ))}
      </div>
    </div>
  );
}

interface BoardProps {
  game: GameState;
  bot: Bot | null;
  selectedId: string | null;
  onSelect: (pieceId: string) => void;
  onMove: (pieceId: string) => void;
}

// Clicking a movable piece selects it and marks where it would land; clicking the mark (or the
// piece again) makes the move.
function Board({ game, bot, selectedId, onSelect, onMove }: BoardProps) {
  const t = useStrings();
  const botTurn = isBotPlayer(bot, game.turn);
  const selected = selectedId ? game.pieces.find((p) => p.id === selectedId) : undefined;
  const preview = selected ? previewMove(game, selected.id) : null;

  return (
    <div className="board" role="grid">
      {COLUMNS.map((letter, col) => (
        <div key={letter} className={`column ${col % 2 ? 'column-dark' : 'column-light'}`} role="row">
          <span className="column-label">{letter}</span>
          {Array.from({ length: ROWS }, (_, row) => {
            const pieces = game.pieces.filter((p) => p.col === col && p.row === row);
            const isTarget = selected && preview && selected.row === row && preview.col === col;
            return (
              <div key={row} className={`cell${pieces.length > 1 ? ' cell-shared' : ''}`} role="gridcell">
                {col === 0 && <span className="row-label">{row + 1}</span>}
                {pieces.map((piece) => {
                  const movable = !botTurn && canMove(game, piece);
                  const classes = [
                    'piece',
                    `bg-${COLOR[piece.player]}`,
                    movable && 'piece-movable',
                    piece.id === selectedId && 'piece-selected',
                    piece.id === preview?.capturedId && 'piece-threatened',
                  ].filter(Boolean);
                  return (
                    <button
                      key={piece.id}
                      className={classes.join(' ')}
                      disabled={!movable}
                      onClick={() => (piece.id === selectedId ? onMove(piece.id) : onSelect(piece.id))}
                      aria-pressed={piece.id === selectedId}
                      aria-label={`${t.player(piece.player)}: ${letter}${row + 1}`}
                    />
                  );
                })}
                {isTarget && (
                  <button
                    className={`target-marker target-${COLOR[selected.player]} target-${preview.kind}`}
                    onClick={() => onMove(selected.id)}
                    title={t.target[preview.effect ?? preview.kind]}
                    aria-label={t.target[preview.effect ?? preview.kind]}
                  >
                    {TARGET_ICON[preview.kind]}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function VictoryBanner({ game, bot, onPlayAgain, onDismiss }: { game: GameState; bot: Bot | null; onPlayAgain: () => void; onDismiss: () => void }) {
  const t = useStrings();
  const winner = game.winner;
  if (!winner) return null;

  let title: string;
  let subtitle = winner === 'draw' ? '' : t.result[game.mode];
  if (winner === 'draw') title = t.status.draw;
  else if (!bot) title = t.wins(t.player(winner));
  else if (winner === 'A') title = t.status.victory;
  else {
    title = t.status.defeated;
    subtitle = t.wins(bot.name);
  }
  const color = winner === 'draw' ? 'navy' : COLOR[winner];

  return (
    <div className="victory-overlay" role="alertdialog" aria-labelledby="victory-title">
      <div className={`victory-card victory-${color}`}>
        <span className="victory-icon" aria-hidden="true">{game.mode === 'race' ? '♛' : '⚔'}</span>
        <h2 id="victory-title" className="victory-title">{title}</h2>
        {subtitle && <p className="victory-subtitle">{subtitle}</p>}
        <div className="victory-actions">
          <button className="pill-button victory-primary" onClick={onPlayAgain}>
            {t.playAgain}
          </button>
          <button className="pill-button" onClick={onDismiss}>
            {t.viewBoard}
          </button>
        </div>
      </div>
    </div>
  );
}

// Briefly announces a rescue or a truce after the move that caused it.
function EventBanner({ game }: { game: GameState }) {
  const t = useStrings();
  const [shown, setShown] = useState<{ kind: 'rescue' | 'truce'; key: number } | null>(null);

  useEffect(() => {
    if (game.event) setShown({ kind: game.event, key: game.moves.length });
  }, [game.event, game.moves.length]);

  useEffect(() => {
    if (!shown) return;
    const timer = setTimeout(() => setShown(null), 2800);
    return () => clearTimeout(timer);
  }, [shown]);

  if (!shown) return null;
  return (
    <div key={shown.key} className={`event-banner event-${shown.kind}`} role="status">
      {t.event[shown.kind]}
    </div>
  );
}

export default function GameArea({ game, bot, onRoll, onMove, onPlayAgain }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [victoryDismissed, setVictoryDismissed] = useState(false);

  // A selection only lasts for the roll it was made with.
  useEffect(() => setSelectedId(null), [game.turn, game.roll, game.moves.length]);
  useEffect(() => setVictoryDismissed(false), [game.winner]);

  const move = (pieceId: string) => {
    setSelectedId(null);
    onMove(pieceId);
  };

  return (
    <main className="game-area">
      <div className="game-row game-row-top">
        <PlayerHeader game={game} player="A" bot={bot} selected={selectedId !== null} />
        <CrownedBar game={game} player="A" />
      </div>

      <div className="game-row game-row-board">
        <RollControl game={game} player="A" bot={bot} onRoll={onRoll} />
        <Board game={game} bot={bot} selectedId={selectedId} onSelect={setSelectedId} onMove={move} />
        <RollControl game={game} player="B" bot={bot} onRoll={onRoll} />
        <EventBanner game={game} />
        {!victoryDismissed && (
          <VictoryBanner game={game} bot={bot} onPlayAgain={onPlayAgain} onDismiss={() => setVictoryDismissed(true)} />
        )}
      </div>

      <div className="game-row game-row-bottom">
        <CrownedBar game={game} player="B" />
        <PlayerHeader game={game} player="B" bot={bot} selected={selectedId !== null} />
      </div>
    </main>
  );
}
