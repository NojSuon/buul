import { createContext, useContext, type ReactNode } from 'react';
import type { Mode, Player } from './game';
import type { Personality } from './bots';

export type Lang = 'en' | 'es';

export const LANGUAGES: { id: Lang; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
];

const en = {
  subtitle: 'The Mayan board game',
  menu: 'Menu',
  nav: {
    playOnline: 'Play online',
    playBots: 'Play with bots',
    learn: 'Learn',
    settings: 'Settings',
    account: 'Account',
    aboutUs: 'About us',
  },
  close: 'Close',
  modeBlurbs: {
    race: 'Maize race: run against your opponent to claim the crown on your troops',
    capture: 'Capture mode: fight against your enemies and capture their armies',
  } as Record<Mode, string>,
  player: (player: Player) => `Player ${player}`,
  roll: 'Roll',
  crownedPieces: 'Crowned pieces',
  capturedPieces: 'Captured pieces',
  status: {
    victory: 'Victory!',
    defeated: 'Defeated',
    draw: 'It’s a draw!',
    waiting: 'Waiting for other player',
    thinking: 'Thinking…',
    yourTurn: 'Your turn – please roll!',
    pick: (n: number) => `You rolled ${n}: pick a piece`,
    confirm: 'Click the marked spot to move',
  },
  target: {
    move: 'Move here',
    capture: 'Move here and capture',
    crown: 'Move here and crown this piece',
    base: 'Goes back to base',
    rescue: 'Capture and rescue your piece',
    truce: 'Capture the rescuer: truce, every piece back to base',
  },
  event: {
    rescue: 'Rescue! The captured piece returns to base',
    truce: 'Truce! Every piece returns to base',
  },
  wins: (name: string) => `${name} wins!`,
  result: {
    race: 'All five pieces crowned',
    capture: 'All five enemy pieces captured',
  } as Record<Mode, string>,
  playAgain: 'Play again',
  viewBoard: 'View board',
  gameId: 'Game ID',
  moves: 'Moves',
  noMoves: 'No moves yet',
  pass: 'pass',
  personality: {
    aggressive: 'Aggressive',
    defensive: 'Defensive',
    moderate: 'Moderate',
  } as Record<Personality, string>,
  personalityHint: {
    aggressive: 'Hunts for captures and charges ahead.',
    defensive: 'Keeps its pieces out of danger.',
    moderate: 'Balances attack and safety.',
  } as Record<Personality, string>,
  settingsPanel: {
    title: 'Settings',
    language: 'Language',
    sound: 'Sound',
    soundOn: 'On',
    soundOff: 'Off',
    opponent: 'Bot opponent',
    opponentHint: 'Used in games against bots. A new choice applies right away.',
    random: 'Random',
    randomHint: 'A different opponent each game.',
  },
  account: {
    title: 'Account',
    body: 'Accounts are coming soon. You’ll be able to save games and invite friends to play online.',
  },
  about: {
    title: 'About us',
    intro: (
      <>
        Welcome! We are <strong>Mati Mati</strong>, a community dedicated to teaching, researching and
        gathering resources about minority communities around the world.
      </>
    ),
    buul: 'This digital edition of Buul is part of that work: a way to share a traditional Maya game with anyone who would like to learn it and play.',
    contact: 'We would be delighted to hear from you. You can write to us or follow our work here:',
    email: 'Email',
  },
  learn: {
    title: 'Learn to play Buul',
    tabs: { history: 'History', basics: 'How to play', race: 'Ixi’im Beel', capture: 'Noj Ba’atel' },
    history: (
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
          <strong> Noj Ba’atel</strong>, roughly “the great battle”, is a fight to capture the whole
          enemy army.
        </p>
      </>
    ),
    basics: {
      boardTitle: 'The board',
      board: 'The board has 11 columns, A to K, and 5 rows. Each player has five pieces, one per row. Teal starts in column A and moves right; orange starts in column K and moves left. A piece always stays on its own row.',
      startCaption: 'Starting position.',
      rollTitle: 'Rolling',
      roll: (
        <>
          Press <strong>Roll</strong> to throw four two-sided dice. Count the marked (filled) faces:
          that’s how many columns you move. If none are marked, you move 5.
        </>
      ),
      moveTitle: 'Moving',
      move: 'After rolling, click one of your highlighted pieces: a dashed circle shows where it would land. Click that circle (or the piece again) to move. Outside your starting column, you can only have one piece per column, so a move into a column you already hold isn’t allowed. If no piece can move, your turn passes.',
      blockedCaption: 'With a 2, the piece on C can’t move: teal already has a piece in column E.',
      captureTitle: 'Capturing',
      capture: 'Move into a column that holds an enemy piece and you capture it, even if it’s on a different row. Pieces waiting in their starting column are safe.',
      captureCaption: 'With a 2, teal moves from C to E and captures the orange piece in column E.',
    },
    race: {
      goal: (
        <>
          <strong>Goal:</strong> be the first to crown all five of your pieces. Each crowned piece is
          worth one point and moves to your <strong>Crowned pieces</strong> bar.
        </>
      ),
      exactTitle: 'Crowning needs an exact roll',
      exact: 'A piece is crowned only when it lands exactly on the last column (K for teal, A for orange).',
      exactCaption: 'On column I, a 2 lands exactly on K and the piece is crowned.',
      overTitle: 'Going too far',
      over: 'If the roll takes the piece past the last column, it goes back to its starting column.',
      overCaption: 'On column I, a 3 would go past the end, so the piece goes back to A.',
      capturesTitle: 'Captures',
      captures: 'A captured piece isn’t lost: it goes back to its starting column and has to run the whole road again.',
      capturesCaption: 'Teal captures in column E and the orange piece goes back to K.',
    },
    capture: {
      goal: (
        <>
          <strong>Goal:</strong> be the first to capture all five enemy pieces. Each capture moves to
          your <strong>Captured pieces</strong> bar.
        </>
      ),
      outTitle: 'Captured pieces are out',
      out: 'A captured piece leaves the game for good, so every capture weakens the enemy army.',
      outCaption: 'Teal captures in column E and the orange piece is out of the game.',
      endTitle: 'Reaching the end',
      end: 'There are no crowns in this mode. A piece that reaches the last column, or goes past it, goes back to its starting column and keeps fighting.',
      endCaption: 'On column I, a 2 reaches K, so the piece goes back to A.',
      rescueTitle: 'Rescue',
      rescue: 'If you capture the enemy piece that captured one of yours on their last turn, you rescue your piece: it goes back to your base, the enemy loses the point for it, and you gain a point for your capture.',
      truceTitle: 'Truce',
      truce: 'If the piece that made the rescue is captured on the very next turn, there is a truce: every piece of both players goes back to base and both scores return to 0.',
    },
  },
};

export type Strings = typeof en;

const es: Strings = {
  subtitle: 'El juego de mesa maya',
  menu: 'Menú',
  nav: {
    playOnline: 'Jugar en línea',
    playBots: 'Jugar con bots',
    learn: 'Aprender',
    settings: 'Configuración',
    account: 'Cuenta',
    aboutUs: 'Sobre nosotros',
  },
  close: 'Cerrar',
  modeBlurbs: {
    race: 'Carrera del maíz: corre contra tu oponente para coronar a tus tropas',
    capture: 'Modo captura: lucha contra tus enemigos y captura sus ejércitos',
  },
  player: (player: Player) => `Jugador ${player}`,
  roll: 'Lanzar',
  crownedPieces: 'Piezas coronadas',
  capturedPieces: 'Piezas capturadas',
  status: {
    victory: '¡Victoria!',
    defeated: 'Derrota',
    draw: '¡Empate!',
    waiting: 'Esperando al otro jugador',
    thinking: 'Pensando…',
    yourTurn: 'Tu turno: ¡lanza los dados!',
    pick: (n: number) => `Sacaste ${n}: elige una pieza`,
    confirm: 'Pulsa la casilla marcada para mover',
  },
  target: {
    move: 'Mover aquí',
    capture: 'Mover aquí y capturar',
    crown: 'Mover aquí y coronar la pieza',
    base: 'Vuelve a la base',
    rescue: 'Capturar y rescatar tu pieza',
    truce: 'Capturar al rescatador: tregua, todas las piezas vuelven a la base',
  },
  event: {
    rescue: '¡Rescate! La pieza capturada vuelve a la base',
    truce: '¡Tregua! Todas las piezas vuelven a la base',
  },
  wins: (name: string) => `¡Gana ${name}!`,
  result: {
    race: 'Las cinco piezas coronadas',
    capture: 'Las cinco piezas enemigas capturadas',
  },
  playAgain: 'Jugar de nuevo',
  viewBoard: 'Ver el tablero',
  gameId: 'ID de partida',
  moves: 'Movimientos',
  noMoves: 'Aún no hay movimientos',
  pass: 'pasa',
  personality: {
    aggressive: 'Agresivo',
    defensive: 'Defensivo',
    moderate: 'Moderado',
  },
  personalityHint: {
    aggressive: 'Busca capturas y avanza sin miedo.',
    defensive: 'Mantiene sus piezas fuera de peligro.',
    moderate: 'Equilibra ataque y seguridad.',
  },
  settingsPanel: {
    title: 'Configuración',
    language: 'Idioma',
    sound: 'Sonido',
    soundOn: 'Activado',
    soundOff: 'Desactivado',
    opponent: 'Rival bot',
    opponentHint: 'Para las partidas contra bots. El cambio se aplica de inmediato.',
    random: 'Aleatorio',
    randomHint: 'Un rival distinto en cada partida.',
  },
  account: {
    title: 'Cuenta',
    body: 'Las cuentas llegarán pronto. Podrás guardar tus partidas e invitar a tus amistades a jugar en línea.',
  },
  about: {
    title: 'Sobre nosotros',
    intro: (
      <>
        ¡Te damos la bienvenida! Somos <strong>Mati Mati</strong>, una comunidad dedicada a enseñar,
        investigar y reunir recursos sobre comunidades minoritarias de todo el mundo.
      </>
    ),
    buul: 'Esta edición digital de Buul forma parte de ese trabajo: una manera de compartir un juego maya tradicional con todas las personas que quieran aprenderlo y jugarlo.',
    contact: 'Nos encantará saber de ti. Puedes escribirnos o seguir nuestro trabajo aquí:',
    email: 'Correo',
  },
  learn: {
    title: 'Aprende a jugar Buul',
    tabs: { history: 'Historia', basics: 'Cómo jugar', race: 'Ixi’im Beel', capture: 'Noj Ba’atel' },
    history: (
      <>
        <p>
          El Buul (también escrito <em>bul</em>) es un juego tradicional de los pueblos mayas de
          Mesoamérica. Relatos de principios del siglo XX lo describen en comunidades mayas mopán del
          sur de Belice, y todavía se recuerda en comunidades mayas de Belice y Guatemala.
        </p>
        <h3>Maíz como dados</h3>
        <p>
          En lugar de dados con números, se lanzaban granos de maíz marcados o quemados por un lado.
          El número de caras marcadas indicaba cuánto avanzar, y si no salía ninguna marca se contaba
          cinco. Los cuatro puntos junto a cada botón Lanzar representan esos cuatro granos.
        </p>
        <h3>Una carrera y una batalla</h3>
        <p>
          Dos bandos avanzan sus piezas uno hacia el otro a lo largo de un camino. Una pieza que
          alcanza a un enemigo lo captura, así que cada tirada es una elección entre adelantarse y
          atacar.
        </p>
        <h3>Los dos modos de esta app</h3>
        <p>
          <strong>Ixi’im Beel</strong>, más o menos «el camino del maíz», es una carrera para coronar
          todas tus piezas. <strong>Noj Ba’atel</strong>, más o menos «la gran batalla», es una lucha
          para capturar a todo el ejército enemigo.
        </p>
      </>
    ),
    basics: {
      boardTitle: 'El tablero',
      board: 'El tablero tiene 11 columnas, de la A a la K, y 5 filas. Cada jugador tiene cinco piezas, una por fila. El turquesa empieza en la columna A y avanza hacia la derecha; el naranja empieza en la K y avanza hacia la izquierda. Cada pieza se queda siempre en su fila.',
      startCaption: 'Posición inicial.',
      rollTitle: 'Lanzar',
      roll: (
        <>
          Pulsa <strong>Lanzar</strong> para tirar cuatro dados de dos caras. Cuenta las caras
          marcadas (rellenas): esas son las columnas que avanzas. Si no hay ninguna marcada, avanzas 5.
        </>
      ),
      moveTitle: 'Mover',
      move: 'Después de lanzar, haz clic en una de tus piezas resaltadas: un círculo punteado muestra dónde caería. Haz clic en ese círculo (o de nuevo en la pieza) para moverla. Fuera de tu columna inicial solo puedes tener una pieza por columna, así que no puedes entrar en una columna donde ya tienes una. Si ninguna pieza puede moverse, pasas el turno.',
      blockedCaption: 'Con un 2, la pieza de la C no puede moverse: el turquesa ya tiene una pieza en la columna E.',
      captureTitle: 'Capturar',
      capture: 'Si entras en una columna donde hay una pieza enemiga, la capturas, aunque esté en otra fila. Las piezas que esperan en su columna inicial están a salvo.',
      captureCaption: 'Con un 2, el turquesa pasa de la C a la E y captura la pieza naranja de la columna E.',
    },
    race: {
      goal: (
        <>
          <strong>Objetivo:</strong> ser el primero en coronar tus cinco piezas. Cada pieza coronada
          vale un punto y pasa a tu barra de <strong>Piezas coronadas</strong>.
        </>
      ),
      exactTitle: 'Coronar requiere la tirada exacta',
      exact: 'Una pieza solo se corona cuando cae exactamente en la última columna (la K para el turquesa, la A para el naranja).',
      exactCaption: 'Desde la columna I, un 2 cae justo en la K y la pieza se corona.',
      overTitle: 'Pasarse',
      over: 'Si la tirada lleva la pieza más allá de la última columna, vuelve a su columna inicial.',
      overCaption: 'Desde la columna I, un 3 se pasaría del final, así que la pieza vuelve a la A.',
      capturesTitle: 'Capturas',
      captures: 'Una pieza capturada no se pierde: vuelve a su columna inicial y tiene que recorrer todo el camino otra vez.',
      capturesCaption: 'El turquesa captura en la columna E y la pieza naranja vuelve a la K.',
    },
    capture: {
      goal: (
        <>
          <strong>Objetivo:</strong> ser el primero en capturar las cinco piezas enemigas. Cada
          captura pasa a tu barra de <strong>Piezas capturadas</strong>.
        </>
      ),
      outTitle: 'Las piezas capturadas quedan fuera',
      out: 'Una pieza capturada sale del juego para siempre, así que cada captura debilita al ejército enemigo.',
      outCaption: 'El turquesa captura en la columna E y la pieza naranja queda fuera del juego.',
      endTitle: 'Llegar al final',
      end: 'En este modo no hay coronas. Una pieza que llega a la última columna, o se pasa, vuelve a su columna inicial y sigue luchando.',
      endCaption: 'Desde la columna I, un 2 llega a la K, así que la pieza vuelve a la A.',
      rescueTitle: 'Rescate',
      rescue: 'Si capturas la pieza enemiga que capturó una de las tuyas en su último turno, rescatas tu pieza: vuelve a tu base, el enemigo pierde el punto por ella y tú ganas un punto por tu captura.',
      truceTitle: 'Tregua',
      truce: 'Si la pieza que hizo el rescate es capturada justo en el turno siguiente, hay tregua: todas las piezas de ambos jugadores vuelven a la base y los dos marcadores vuelven a 0.',
    },
  },
};

const STRINGS: Record<Lang, Strings> = { en, es };

const LanguageContext = createContext<Strings>(en);

export function LanguageProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LanguageContext.Provider value={STRINGS[lang]}>{children}</LanguageContext.Provider>;
}

export const useStrings = () => useContext(LanguageContext);
