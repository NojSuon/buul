import type { Bot } from '../bots';
import { COLUMNS, ROWS, canMove, other, type GameState, type Player } from '../game';
import { useStrings, type Strings } from '../i18n';

interface Props {
  game: GameState;
  // The bot playing B, or null when two people share the screen.
  bot: Bot | null;
  onRoll: () => void;
  onMove: (pieceId: string) => void;
}

const COLOR: Record<Player, string> = { A: 'teal', B: 'orange' };

const isBotPlayer = (bot: Bot | null, player: Player) => bot !== null && player === 'B';

function statusText(t: Strings, game: GameState, player: Player, bot: Bot | null): string {
  if (game.winner) {
    if (game.winner === 'draw') return t.status.draw;
    return game.winner === player ? t.status.victory : t.status.defeated;
  }
  if (game.turn !== player) return t.status.waiting;
  if (isBotPlayer(bot, player)) return t.status.thinking;
  if (game.roll === null) return t.status.yourTurn;
  return t.status.move(game.roll);
}

function PlayerHeader({ game, player, bot }: { game: GameState; player: Player; bot: Bot | null }) {
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
      <p className="player-status">{statusText(t, game, player, bot)}</p>
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
      <button className={`roll-button bg-${COLOR[player]}`} disabled={!enabled} onClick={onRoll}>
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

function Board({ game, bot, onMove }: { game: GameState; bot: Bot | null; onMove: (pieceId: string) => void }) {
  const t = useStrings();
  const botTurn = isBotPlayer(bot, game.turn);
  return (
    <div className="board" role="grid">
      {COLUMNS.map((letter, col) => (
        <div key={letter} className={`column ${col % 2 ? 'column-dark' : 'column-light'}`} role="row">
          <span className="column-label">{letter}</span>
          {Array.from({ length: ROWS }, (_, row) => {
            const pieces = game.pieces.filter((p) => p.col === col && p.row === row);
            return (
              <div key={row} className={`cell${pieces.length > 1 ? ' cell-shared' : ''}`} role="gridcell">
                {col === 0 && <span className="row-label">{row + 1}</span>}
                {pieces.map((piece) => {
                  const movable = !botTurn && canMove(game, piece);
                  return (
                    <button
                      key={piece.id}
                      className={`piece bg-${COLOR[piece.player]}${movable ? ' piece-movable' : ''}`}
                      disabled={!movable}
                      onClick={() => onMove(piece.id)}
                      aria-label={`${t.player(piece.player)}: ${letter}${row + 1}`}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function GameArea({ game, bot, onRoll, onMove }: Props) {
  return (
    <main className="game-area">
      <div className="game-row game-row-top">
        <PlayerHeader game={game} player="A" bot={bot} />
        <CrownedBar game={game} player="A" />
      </div>

      <div className="game-row game-row-board">
        <RollControl game={game} player="A" bot={bot} onRoll={onRoll} />
        <Board game={game} bot={bot} onMove={onMove} />
        <RollControl game={game} player="B" bot={bot} onRoll={onRoll} />
      </div>

      <div className="game-row game-row-bottom">
        <CrownedBar game={game} player="B" />
        <PlayerHeader game={game} player="B" bot={bot} />
      </div>
    </main>
  );
}
