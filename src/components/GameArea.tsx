import { COLUMNS, ROWS, canMove, other, type GameState, type Opponent, type Player } from '../game';

interface Props {
  game: GameState;
  opponent: Opponent;
  onRoll: () => void;
  onMove: (pieceId: string) => void;
}

const COLOR: Record<Player, string> = { A: 'teal', B: 'orange' };

function statusText(game: GameState, player: Player, opponent: Opponent): string {
  if (game.winner) {
    if (game.winner === 'draw') return 'It’s a draw!';
    return game.winner === player ? 'Victory!' : 'Defeated';
  }
  if (game.turn !== player) return 'Waiting for other player';
  if (opponent === 'bot' && player === 'B') return 'Bot is thinking…';
  if (game.roll === null) return 'Your turn – please roll!';
  return `Move a piece ${game.roll} ${game.roll === 1 ? 'step' : 'steps'}`;
}

function PlayerHeader({ game, player, opponent }: { game: GameState; player: Player; opponent: Opponent }) {
  const name = opponent === 'bot' && player === 'B' ? 'Bot' : `Player ${player}`;
  return (
    <div className={`player-header player-header-${player.toLowerCase()}`}>
      <div className="player-title">
        <span className={`swatch swatch-${COLOR[player]}`} aria-hidden="true" />
        <h2>{name}</h2>
      </div>
      <p className="player-status">{statusText(game, player, opponent)}</p>
    </div>
  );
}

// Race mode scores crowned pieces; capture mode scores captured enemy pieces.
function CrownedBar({ game, player }: { game: GameState; player: Player }) {
  const race = game.mode === 'race';
  const count = race ? game.crowned[player] : game.captured[player];
  const label = race ? 'Crowned pieces' : 'Captured pieces';
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

function RollControl({ game, player, opponent, onRoll }: { game: GameState; player: Player; opponent: Opponent; onRoll: () => void }) {
  const isBot = opponent === 'bot' && player === 'B';
  const enabled = game.turn === player && game.roll === null && !game.winner && !isBot;
  const dice = game.dice[player] ?? [false, false, false, false];
  return (
    <div className="roll">
      <button className={`roll-button bg-${COLOR[player]}`} disabled={!enabled} onClick={onRoll}>
        Roll
      </button>
      <div className="dice" aria-label={game.dice[player] ? `Rolled ${dice.filter(Boolean).length} marked` : 'Not rolled yet'}>
        {dice.map((marked, i) => (
          <span key={i} className={`die die-${COLOR[player]}${marked ? ' die-marked' : ''}`} />
        ))}
      </div>
    </div>
  );
}

function Board({ game, opponent, onMove }: { game: GameState; opponent: Opponent; onMove: (pieceId: string) => void }) {
  const botTurn = opponent === 'bot' && game.turn === 'B';
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
                      aria-label={`Player ${piece.player} piece on ${letter}${row + 1}`}
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

export default function GameArea({ game, opponent, onRoll, onMove }: Props) {
  return (
    <main className="game-area">
      <div className="game-row game-row-top">
        <PlayerHeader game={game} player="A" opponent={opponent} />
        <CrownedBar game={game} player="A" />
      </div>

      <div className="game-row game-row-board">
        <RollControl game={game} player="A" opponent={opponent} onRoll={onRoll} />
        <Board game={game} opponent={opponent} onMove={onMove} />
        <RollControl game={game} player="B" opponent={opponent} onRoll={onRoll} />
      </div>

      <div className="game-row game-row-bottom">
        <CrownedBar game={game} player="B" />
        <PlayerHeader game={game} player="B" opponent={opponent} />
      </div>
    </main>
  );
}
