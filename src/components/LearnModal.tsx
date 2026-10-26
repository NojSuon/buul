import { useState, type ReactNode } from 'react';
import { useStrings } from '../i18n';
import Modal from './Modal';
import MiniBoard from './MiniBoard';

const TAB_IDS = ['history', 'basics', 'race', 'capture'] as const;

type TabId = (typeof TAB_IDS)[number];

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
  return useStrings().learn.history;
}

function BasicsTab() {
  const t = useStrings().learn.basics;
  return (
    <>
      <h3>{t.boardTitle}</h3>
      <p>{t.board}</p>
      <Figure caption={t.startCaption}>
        <MiniBoard
          rows={5}
          pieces={[0, 1, 2, 3, 4].flatMap((row) => [
            { player: 'A' as const, col: 0, row },
            { player: 'B' as const, col: 10, row },
          ])}
        />
      </Figure>

      <h3>{t.rollTitle}</h3>
      <p>{t.roll}</p>
      <div className="dice-examples">
        <DiceExample marked={1} value={1} />
        <DiceExample marked={2} value={2} />
        <DiceExample marked={3} value={3} />
        <DiceExample marked={4} value={4} />
        <DiceExample marked={0} value={5} />
      </div>

      <h3>{t.moveTitle}</h3>
      <p>{t.move}</p>
      <Figure caption={t.blockedCaption}>
        <MiniBoard
          pieces={[
            { player: 'A', col: 2, row: 0 },
            { player: 'A', col: 4, row: 2 },
          ]}
          moves={[{ row: 0, from: 2, to: 4, style: 'blocked' }]}
        />
      </Figure>

      <h3>{t.captureTitle}</h3>
      <p>{t.capture}</p>
      <Figure caption={t.captureCaption}>
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
  const t = useStrings().learn.race;
  return (
    <>
      <p>{t.goal}</p>
      <h3>{t.exactTitle}</h3>
      <p>{t.exact}</p>
      <Figure caption={t.exactCaption}>
        <MiniBoard
          pieces={[
            { player: 'A', col: 8, row: 1, state: 'ghost' },
            { player: 'A', col: 10, row: 1, state: 'crowned' },
          ]}
          moves={[{ row: 1, from: 8, to: 10 }]}
        />
      </Figure>
      <h3>{t.overTitle}</h3>
      <p>{t.over}</p>
      <Figure caption={t.overCaption}>
        <MiniBoard
          pieces={[
            { player: 'A', col: 8, row: 1, state: 'ghost' },
            { player: 'A', col: 0, row: 1, state: 'highlight' },
          ]}
          moves={[{ row: 1, from: 8, to: 11, style: 'dashed' }]}
        />
      </Figure>
      <h3>{t.capturesTitle}</h3>
      <p>{t.captures}</p>
      <Figure caption={t.capturesCaption}>
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
  const t = useStrings().learn.capture;
  return (
    <>
      <p>{t.goal}</p>
      <h3>{t.outTitle}</h3>
      <p>{t.out}</p>
      <Figure caption={t.outCaption}>
        <MiniBoard
          pieces={[
            { player: 'A', col: 2, row: 0, state: 'ghost' },
            { player: 'A', col: 4, row: 0, state: 'highlight' },
            { player: 'B', col: 4, row: 2, state: 'captured' },
          ]}
          moves={[{ row: 0, from: 2, to: 4 }]}
        />
      </Figure>
      <h3>{t.endTitle}</h3>
      <p>{t.end}</p>
      <Figure caption={t.endCaption}>
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
  const t = useStrings().learn;
  const [tab, setTab] = useState<TabId>('history');
  const Content = CONTENT[tab];

  return (
    <Modal title={t.title} onClose={onClose} className="modal-learn">
      <div className="tabs" role="tablist">
        {TAB_IDS.map((id) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={`tab${tab === id ? ' tab-active' : ''}`}
            onClick={() => setTab(id)}
          >
            {t.tabs[id]}
          </button>
        ))}
      </div>
      <div className="modal-body learn-body" role="tabpanel" key={tab}>
        <Content />
      </div>
    </Modal>
  );
}
