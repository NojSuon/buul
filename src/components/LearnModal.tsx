import { useState, type ReactNode } from 'react';
import Modal from './Modal';
import MiniBoard from './MiniBoard';

const TABS = [
  { id: 'history', label: 'History' },
  { id: 'basics', label: 'How to play' },
  { id: 'race', label: 'Ixi’im Beel' },
  { id: 'capture', label: 'Noj Ba’atel' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function Figure({ caption, children }: { caption: ReactNode; children: ReactNode }) {
  return (
    <figure className="learn-figure">
      {children}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

function DiceExample({ marked, value }: { marked: number; value: number }) {
  return (
    <div className="dice-example">
      {Array.from({ length: 4 }, (_, i) => (
        <span key={i} className={`die die-teal${i < marked ? ' die-marked' : ''}`} />
      ))}
      <span className="dice-example-value">= {value}</span>
    </div>
  );
}

function HistoryTab() {
  return (
    <>
      <p>
        Buul (also written <em>bul</em>) is a traditional game of the Maya peoples of Mesoamerica.
        Accounts from the early twentieth century describe it being played by Mopan Maya
        communities in southern Belize, and it is still remembered in Maya communities of Belize
        and Guatemala.
      </p>
      <h3>Maize for dice</h3>
      <p>
        Instead of numbered dice, players threw grains of maize marked or burnt on one side. The
        number of marked sides showing told you how far to move, and no marks at all counted as
        five. The four dots next to each Roll button in this app stand for those four grains.
      </p>
      <h3>A race and a battle</h3>
      <p>
        Two sides march their pieces toward each other along a track. A piece that catches an enemy
        captures it, so every roll is a choice between running ahead and attacking.
      </p>
      <h3>The two modes in this app</h3>
      <p>
        <strong>Ixi’im Beel</strong>, roughly “the maize road”, is a race to crown all your pieces.
        <strong> Noj Ba’atel</strong>, roughly “the great battle”, is a fight to capture the
        whole enemy army.
      </p>
    </>
  );
}

function BasicsTab() {
  return (
    <>
      <h3>The board</h3>
      <p>
        The board has 11 columns, A to K, and 5 rows. Each player has five pieces, one per row.
        Teal starts in column A and moves right; orange starts in column K and moves left. A piece
        always stays on its own row.
      </p>
      <Figure caption="Starting position.">
        <MiniBoard
          rows={5}
          pieces={[0, 1, 2, 3, 4].flatMap((row) => [
            { player: 'A' as const, col: 0, row },
            { player: 'B' as const, col: 10, row },
          ])}
        />
      </Figure>

      <h3>Rolling</h3>
      <p>
        Press <strong>Roll</strong> to throw four two-sided dice. Count the marked (filled) faces:
        that’s how many columns you move. If none are marked, you move 5.
      </p>
      <div className="dice-examples">
        <DiceExample marked={1} value={1} />
        <DiceExample marked={2} value={2} />
        <DiceExample marked={3} value={3} />
        <DiceExample marked={4} value={4} />
        <DiceExample marked={0} value={5} />
      </div>

      <h3>Moving</h3>
      <p>
        After rolling, click one of your highlighted pieces to move it. Outside your starting
        column, you can only have one piece per column, so a move into a column you already hold
        isn’t allowed. If no piece can move, your turn passes.
      </p>
      <Figure caption="With a 2, the piece on C can’t move: teal already has a piece in column E.">
        <MiniBoard
          pieces={[
            { player: 'A', col: 2, row: 0 },
            { player: 'A', col: 4, row: 2 },
          ]}
          moves={[{ row: 0, from: 2, to: 4, style: 'blocked' }]}
        />
      </Figure>

      <h3>Capturing</h3>
      <p>
        Move into a column that holds an enemy piece and you capture it, even if it’s on a
        different row. Pieces waiting in their starting column are safe.
      </p>
      <Figure caption="With a 2, teal moves from C to E and captures the orange piece in column E.">
        <MiniBoard
          pieces={[
            { player: 'A', col: 2, row: 0, state: 'ghost' },
            { player: 'A', col: 4, row: 0, state: 'highlight' },
            { player: 'B', col: 4, row: 2, state: 'captured' },
          ]}
          moves={[{ row: 0, from: 2, to: 4 }]}
        />
      </Figure>
    </>
  );
}

function RaceTab() {
  return (
    <>
      <p>
        <strong>Goal:</strong> be the first to crown all five of your pieces. Each crowned piece
        is worth one point and moves to your <strong>Crowned pieces</strong> bar.
      </p>
      <h3>Crowning needs an exact roll</h3>
      <p>
        A piece is crowned only when it lands exactly on the last column (K for teal, A for
        orange).
      </p>
      <Figure caption="On column I, a 2 lands exactly on K and the piece is crowned.">
        <MiniBoard
          pieces={[
            { player: 'A', col: 8, row: 1, state: 'ghost' },
            { player: 'A', col: 10, row: 1, state: 'crowned' },
          ]}
          moves={[{ row: 1, from: 8, to: 10 }]}
        />
      </Figure>
      <h3>Going too far</h3>
      <p>If the roll takes the piece past the last column, it goes back to its starting column.</p>
      <Figure caption="On column I, a 3 would go past the end, so the piece goes back to A.">
        <MiniBoard
          pieces={[
            { player: 'A', col: 8, row: 1, state: 'ghost' },
            { player: 'A', col: 0, row: 1, state: 'highlight' },
          ]}
          moves={[{ row: 1, from: 8, to: 11, style: 'dashed' }]}
        />
      </Figure>
      <h3>Captures</h3>
      <p>
        A captured piece isn’t lost: it goes back to its starting column and has to run the whole
        road again.
      </p>
      <Figure caption="Teal captures in column E and the orange piece goes back to K.">
        <MiniBoard
          pieces={[
            { player: 'A', col: 2, row: 0, state: 'ghost' },
            { player: 'A', col: 4, row: 0, state: 'highlight' },
            { player: 'B', col: 4, row: 2, state: 'ghost' },
            { player: 'B', col: 10, row: 2, state: 'highlight' },
          ]}
          moves={[
            { row: 0, from: 2, to: 4 },
            { row: 2, from: 4, to: 10, style: 'dashed' },
          ]}
        />
      </Figure>
    </>
  );
}

function CaptureTab() {
  return (
    <>
      <p>
        <strong>Goal:</strong> be the first to capture all five enemy pieces. Each capture moves to
        your <strong>Captured pieces</strong> bar.
      </p>
      <h3>Captured pieces are out</h3>
      <p>A captured piece leaves the game for good, so every capture weakens the enemy army.</p>
      <Figure caption="Teal captures in column E and the orange piece is out of the game.">
        <MiniBoard
          pieces={[
            { player: 'A', col: 2, row: 0, state: 'ghost' },
            { player: 'A', col: 4, row: 0, state: 'highlight' },
            { player: 'B', col: 4, row: 2, state: 'captured' },
          ]}
          moves={[{ row: 0, from: 2, to: 4 }]}
        />
      </Figure>
      <h3>Reaching the end</h3>
      <p>
        There are no crowns in this mode. A piece that reaches the last column, or goes past it,
        goes back to its starting column and keeps fighting.
      </p>
      <Figure caption="On column I, a 2 reaches K, so the piece goes back to A.">
        <MiniBoard
          pieces={[
            { player: 'A', col: 8, row: 1, state: 'ghost' },
            { player: 'A', col: 0, row: 1, state: 'highlight' },
          ]}
          moves={[{ row: 1, from: 8, to: 10, style: 'dashed' }]}
        />
      </Figure>
    </>
  );
}

const CONTENT: Record<TabId, () => ReactNode> = {
  history: HistoryTab,
  basics: BasicsTab,
  race: RaceTab,
  capture: CaptureTab,
};

export default function LearnModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<TabId>('history');
  const Content = CONTENT[tab];

  return (
    <Modal title="Learn to play Buul" onClose={onClose} className="modal-learn">
      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`tab${tab === t.id ? ' tab-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="modal-body learn-body" role="tabpanel" key={tab}>
        <Content />
      </div>
    </Modal>
  );
}
