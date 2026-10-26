import { useEffect, useState } from 'react';
import type { Bot } from '../bots';
import { COLUMNS, ROWS, canMove, other, previewMove, type GameState, type Player } from '../game';
import { useStrings, type Strings } from '../i18n';

// Who plays each colour: the person at this screen, a bot, or a friend online.
export interface Seat {
  kind: 'me' | 'bot' | 'remote';
  // Shown instead of "Player A/B" when known (a nickname or a bot's name).
  name?: string;
  bot?: Bot;
}

const seatName = (t: Strings, seats: Record<Player, Seat>, player: Player) => seats[player].name ?? t.player(player);

// A message laid over the board, such as "your friend left", with one action.
export interface BoardNotice {
  title: string;
  action: string;
  onAction: () => void;
}

interface Props {
  game: GameState;
  seats: Record<Player, Seat>;
  // Nothing can be played yet (an online game waiting for the second player).
  locked: boolean;
  notice: BoardNotice | null;
  onRoll: () => void;
  onMove: (pieceId: string) => void;
  onPlayAgain: () => void;
}

const COLOR: Record<Player, string> = { A: 'teal', B: 'orange' };
const TARGET_ICON = { move: '', capture: '✕', crown: '♛', base: '↺' };

function statusText(t: Strings, game: GameState, player: Player, seats: Record<Player, Seat>, locked: boolean, selected: boolean): string {
  const seat = seats[player];
  if (locked) return seat.kind === 'me' ? t.online.waitingStatus : '';
  if (game.winner) {
    if (game.winner === 'draw') return t.status.draw;
    return game.winner === player ? t.status.victory : t.status.defeated;
  }
  if (game.turn !== player) return t.status.waiting;
  if (seat.kind === 'bot') return t.status.thinking;
  if (seat.kind === 'remote') return t.online.opponentTurn(seatName(t, seats, player));
  if (game.roll === null) return t.status.yourTurn;
  return selected ? t.status.confirm : t.status.pick(game.roll);
}

interface HeaderProps {
  game: GameState;
  player: Player;
  seats: Record<Player, Seat>;
  locked: boolean;
  selected: boolean;
}

function PlayerHeader({ game, player, seats, locked, selected }: HeaderProps) {
  const t = useStrings();
  const seat = seats[player];
  const online = seats.A.kind === 'remote' || seats.B.kind === 'remote';
  return (
    <div className={`player-header player-header-${player.toLowerCase()}`}>
      <div className="player-title">
        <span className={`swatch swatch-${COLOR[player]}`} aria-hidden="true" />
        <h2>{seatName(t, seats, player)}</h2>
        {seat.bot && <span className={`bot-tag bot-tag-${seat.bot.personality}`}>{t.personality[seat.bot.personality]}</span>}
        {online && seat.kind === 'me' && <span className="bot-tag bot-tag-you">{t.online.you}</span>}
      </div>
      <p className="player-status">{statusText(t, game, player, seats, locked, selected)}</p>
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

function RollControl({ game, player, playable, onRoll }: { game: GameState; player: Player; playable: boolean; onRoll: () => void }) {
  const t = useStrings();
  const enabled = playable && game.turn === player && game.roll === null && !game.winner;
  const dice = game.dice[player] ?? [false, false, false, false];
  return (
    <div className={`roll roll-${player.toLowerCase()}`}>
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
  // The person at this screen may move now.
  playable: boolean;
  selectedId: string | null;
  onSelect: (pieceId: string) => void;
  onMove: (pieceId: string) => void;
}

// Clicking a movable piece selects it and marks where it would land; clicking the mark (or the
// piece again) makes the move.
function Board({ game, playable, selectedId, onSelect, onMove }: BoardProps) {
  const t = useStrings();
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
                  const movable = playable && canMove(game, piece);
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

function VictoryBanner({ game, seats, onPlayAgain, onDismiss }: { game: GameState; seats: Record<Player, Seat>; onPlayAgain: () => void; onDismiss: () => void }) {
  const t = useStrings();
  const winner = game.winner;
  if (!winner) return null;

  let title: string;
  let subtitle = winner === 'draw' ? '' : t.result[game.mode];
  if (winner === 'draw') title = t.status.draw;
  else if (seats[winner].kind === 'me') title = t.status.victory;
  else {
    title = t.status.defeated;
    subtitle = t.wins(seatName(t, seats, winner));
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

function NoticeBanner({ notice }: { notice: BoardNotice }) {
  return (
    <div className="victory-overlay" role="alertdialog" aria-labelledby="notice-title">
      <div className="victory-card notice-card">
        <h2 id="notice-title" className="notice-title">{notice.title}</h2>
        <div className="victory-actions">
          <button className="pill-button victory-primary" onClick={notice.onAction}>
            {notice.action}
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

export default function GameArea({ game, seats, locked, notice, onRoll, onMove, onPlayAgain }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [victoryDismissed, setVictoryDismissed] = useState(false);

  // A selection only lasts for the roll it was made with.
  useEffect(() => setSelectedId(null), [game.turn, game.roll, game.moves.length]);
  useEffect(() => setVictoryDismissed(false), [game.winner]);

  const move = (pieceId: string) => {
    setSelectedId(null);
    onMove(pieceId);
  };

  // Only the person at this screen plays, on their own turn.
  const playable = (player: Player) => !locked && !notice && seats[player].kind === 'me';
  const header = (player: Player) => (
    <PlayerHeader game={game} player={player} seats={seats} locked={locked} selected={selectedId !== null} />
  );

  return (
    <main className="game-area">
      <div className="game-row game-row-top">
        {header('A')}
        <CrownedBar game={game} player="A" />
      </div>

      <div className="game-row game-row-board">
        <RollControl game={game} player="A" playable={playable('A')} onRoll={onRoll} />
        <Board game={game} playable={playable(game.turn)} selectedId={selectedId} onSelect={setSelectedId} onMove={move} />
        <RollControl game={game} player="B" playable={playable('B')} onRoll={onRoll} />
        <EventBanner game={game} />
        {notice ? (
          <NoticeBanner notice={notice} />
        ) : (
          !victoryDismissed && (
            <VictoryBanner game={game} seats={seats} onPlayAgain={onPlayAgain} onDismiss={() => setVictoryDismissed(true)} />
          )
        )}
      </div>

      <div className="game-row game-row-bottom">
        <CrownedBar game={game} player="B" />
        {header('B')}
      </div>
    </main>
  );
}
