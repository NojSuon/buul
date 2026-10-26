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
    joinGame: 'Join with a code',
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
    truce: 'Capture the rescuer: truce, the exchange returns to base',
  },
  event: {
    rescue: 'Rescue! The captured piece returns to base',
    truce: 'Truce! The pieces of the exchange return to base',
  },
  wins: (name: string) => `${name} wins!`,
  result: {
    race: 'All five pieces crowned',
    capture: 'All five enemy pieces captured',
  } as Record<Mode, string>,
  playAgain: 'Play again',
  viewBoard: 'View board',
  online: {
    createTitle: (mode: string) => `Play ${mode} online`,
    joinTitle: 'Join a friend’s game',
    waitingTitle: 'Invite your friend',
    playingAs: (name: string) => `You’ll play as ${name}.`,
    guestIntro: 'Choose a nickname for this game, or sign in to use your account.',
    orSignIn: 'Sign in with Google instead',
    needsNickname: 'Create your nickname in Account first.',
    openAccount: 'Open Account',
    create: 'Create game',
    join: 'Join game',
    connecting: 'Connecting…',
    codeLabel: 'Game code',
    inviteLabel: 'Invite link',
    share: 'Send this code or link to your friend. The game starts as soon as they join.',
    shareText: 'Play Buul with me!',
    copyLink: 'Copy invite link',
    copied: 'Copied!',
    shareButton: 'Share…',
    waiting: 'Waiting for your friend to join…',
    cancel: 'Cancel this game',
    trust: 'Dice are rolled on each player’s own device, so play with people you trust.',
    errors: {
      'bad-code': 'Enter the 6-digit game code.',
      'not-found': 'No game is waiting with that code. Check it with your friend.',
      full: 'That game has already started with someone else.',
      'guests-disabled': 'Playing as a guest isn’t switched on yet. Sign in with Google instead.',
      connection: 'Couldn’t connect. Check your internet and try again.',
    },
    you: 'You',
    opponentTurn: (name: string) => `${name} is playing…`,
    waitingStatus: 'Waiting for your friend to join…',
    left: (name: string) => `${name} left the game`,
    backToBots: 'Play against a bot',
    leave: 'Leave game',
  },
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
    loading: 'Loading…',
    intro: 'Sign in to keep your game statistics on any device. You can always play without an account.',
    signIn: 'Continue with Google',
    ageNote: 'Accounts are for ages 13 and up. We only store a nickname and your game statistics.',
    privacyLink: 'Read our privacy policy',
    createTitle: 'Create your nickname',
    createIntro: 'Choose how you want to be called in Buul. Please don’t use your real name.',
    create: 'Create',
    suggest: 'Suggest a nickname',
    nickname: 'Nickname',
    nicknameHint: 'Shown instead of your real name. 2–20 characters.',
    nicknameProblems: {
      length: 'Use between 2 and 20 characters.',
      characters: 'Use only letters, numbers, spaces and _ - . (no double spaces).',
      offensive: 'That nickname isn’t allowed. Please choose a respectful one.',
    },
    save: 'Save',
    saved: 'Saved',
    stats: 'Your statistics (games against bots)',
    mode: 'Mode',
    played: 'Played',
    won: 'Won',
    signOut: 'Sign out',
    deleteAccount: 'Delete my account',
    deleteConfirm: 'This permanently deletes your nickname, your statistics and your account. Google will ask you to confirm it’s you.',
    deleteYes: 'Yes, delete everything',
    cancel: 'Cancel',
    profileFailed: 'You’re signed in, but your profile couldn’t be loaded.',
    retry: 'Try again',
    errors: {
      'unauthorized-domain': 'Sign-in isn’t enabled for this website address yet.',
      'popup-blocked': 'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.',
      network: 'Couldn’t reach the server. Check your connection and try again.',
      other: 'Something went wrong. Please try again.',
    },
  },
  privacy: {
    title: 'Privacy policy',
    body: (
      <>
        <p>
          <em>Last updated: October 2026.</em> Buul is made by <strong>Mati Mati</strong>. Questions
          or requests: <a href="mailto:matimati.info@gmail.com">matimati.info@gmail.com</a>.
        </p>
        <h3>Playing without an account</h3>
        <p>
          We collect no personal data. Your language, sound and bot settings are saved only in your
          own browser.
        </p>
        <h3>Signing in</h3>
        <p>
          Accounts use “Continue with Google” through Firebase Authentication, a Google service.
          To sign you in, Firebase receives your Google account’s email address, name and picture.
          We use them only to sign you in: we don’t show your name or picture, and we never email
          you.
        </p>
        <h3>What we store</h3>
        <p>
          The nickname you choose, your game statistics (games played and won against bots in each
          mode), and the date your account was created. They are stored in Google Cloud Firestore,
          in data centres in the European Union.
        </p>
        <h3>Playing online</h3>
        <p>
          To play online without an account, Firebase gives your browser a random anonymous ID, with
          no email or name attached. While an online game lasts we store both players’ nicknames,
          that ID or account ID, and the moves of the game. Your opponent sees your nickname.
          A game is deleted when both players leave it, and automatically two days after it started.
        </p>
        <h3>What we never do</h3>
        <p>No ads, no analytics, no tracking, and we never sell or share your data.</p>
        <h3>Who can see it</h3>
        <p>
          Only you, plus your nickname for the opponent of an online game. Security rules stop
          anyone else from reading or changing your data. The Mati Mati team can access the
          database only to keep the service running.
        </p>
        <h3>Where it is processed</h3>
        <p>
          Firebase is operated by Google, so sign-in data may be processed outside your country,
          including in the United States, under Google’s data protection terms.
        </p>
        <h3>Deleting your data</h3>
        <p>
          Open <strong>Account → Delete my account</strong> to permanently erase your nickname,
          statistics, online games and account straight away, or email us and we will do it for
          you.
        </p>
        <h3>Children</h3>
        <p>
          Accounts and online play are for ages 13 and up. Younger players can play against the
          bots, which stores nothing about them.
        </p>
        <h3>Changes</h3>
        <p>If this policy changes, we will update this page and its date.</p>
      </>
    ),
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
    privacy: 'Privacy policy',
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
      truce: 'If the piece that made the rescue is captured on the very next turn, there is a truce: every piece involved in the exchange goes back to its base, the others stay where they are, and both scores return to what they were before the exchange.',
    },
  },
};

export type Strings = typeof en;

const es: Strings = {
  subtitle: 'El juego de mesa maya',
  menu: 'Menú',
  nav: {
    playOnline: 'Jugar en línea',
    joinGame: 'Unirse con un código',
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
    truce: 'Capturar al rescatador: tregua, el intercambio vuelve a la base',
  },
  event: {
    rescue: '¡Rescate! La pieza capturada vuelve a la base',
    truce: '¡Tregua! Las piezas del intercambio vuelven a la base',
  },
  wins: (name: string) => `¡Gana ${name}!`,
  result: {
    race: 'Las cinco piezas coronadas',
    capture: 'Las cinco piezas enemigas capturadas',
  },
  playAgain: 'Jugar de nuevo',
  viewBoard: 'Ver el tablero',
  online: {
    createTitle: (mode: string) => `Jugar ${mode} en línea`,
    joinTitle: 'Unirse a la partida de un amigo',
    waitingTitle: 'Invita a tu amigo',
    playingAs: (name: string) => `Jugarás como ${name}.`,
    guestIntro: 'Elige un apodo para esta partida, o inicia sesión para usar tu cuenta.',
    orSignIn: 'Mejor iniciar sesión con Google',
    needsNickname: 'Primero crea tu apodo en Cuenta.',
    openAccount: 'Abrir Cuenta',
    create: 'Crear partida',
    join: 'Unirse',
    connecting: 'Conectando…',
    codeLabel: 'Código de partida',
    inviteLabel: 'Enlace de invitación',
    share: 'Envía este código o enlace a tu amigo. La partida empieza en cuanto se una.',
    shareText: '¡Juega Buul conmigo!',
    copyLink: 'Copiar enlace',
    copied: '¡Copiado!',
    shareButton: 'Compartir…',
    waiting: 'Esperando a que tu amigo se una…',
    cancel: 'Cancelar esta partida',
    trust: 'Los dados se lanzan en el dispositivo de cada jugador, así que juega con personas de confianza.',
    errors: {
      'bad-code': 'Escribe el código de 6 dígitos.',
      'not-found': 'No hay ninguna partida esperando con ese código. Revísalo con tu amigo.',
      full: 'Esa partida ya empezó con otra persona.',
      'guests-disabled': 'Jugar como invitado aún no está activado. Inicia sesión con Google.',
      connection: 'No se pudo conectar. Revisa tu internet e inténtalo de nuevo.',
    },
    you: 'Tú',
    opponentTurn: (name: string) => `${name} está jugando…`,
    waitingStatus: 'Esperando a que tu amigo se una…',
    left: (name: string) => `${name} salió de la partida`,
    backToBots: 'Jugar contra un bot',
    leave: 'Salir de la partida',
  },
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
    loading: 'Cargando…',
    intro: 'Inicia sesión para conservar tus estadísticas en cualquier dispositivo. Siempre puedes jugar sin cuenta.',
    signIn: 'Continuar con Google',
    ageNote: 'Las cuentas son para mayores de 13 años. Solo guardamos un apodo y tus estadísticas de juego.',
    privacyLink: 'Lee nuestra política de privacidad',
    createTitle: 'Crea tu apodo',
    createIntro: 'Elige cómo quieres que te llamen en Buul. Por favor, no uses tu nombre real.',
    create: 'Crear',
    suggest: 'Sugerir un apodo',
    nickname: 'Apodo',
    nicknameHint: 'Se muestra en lugar de tu nombre real. De 2 a 20 caracteres.',
    nicknameProblems: {
      length: 'Usa entre 2 y 20 caracteres.',
      characters: 'Usa solo letras, números, espacios y _ - . (sin espacios dobles).',
      offensive: 'Ese apodo no está permitido. Por favor, elige uno respetuoso.',
    },
    save: 'Guardar',
    saved: 'Guardado',
    stats: 'Tus estadísticas (partidas contra bots)',
    mode: 'Modo',
    played: 'Jugadas',
    won: 'Ganadas',
    signOut: 'Cerrar sesión',
    deleteAccount: 'Eliminar mi cuenta',
    deleteConfirm: 'Esto elimina para siempre tu apodo, tus estadísticas y tu cuenta. Google te pedirá que confirmes que eres tú.',
    deleteYes: 'Sí, eliminar todo',
    cancel: 'Cancelar',
    profileFailed: 'Iniciaste sesión, pero no se pudo cargar tu perfil.',
    retry: 'Reintentar',
    errors: {
      'unauthorized-domain': 'El inicio de sesión aún no está activado para esta dirección web.',
      'popup-blocked': 'Tu navegador bloqueó la ventana de inicio de sesión. Permite las ventanas emergentes para este sitio e inténtalo de nuevo.',
      network: 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
      other: 'Algo salió mal. Inténtalo de nuevo.',
    },
  },
  privacy: {
    title: 'Política de privacidad',
    body: (
      <>
        <p>
          <em>Última actualización: octubre de 2026.</em> Buul es un proyecto de{' '}
          <strong>Mati Mati</strong>. Preguntas o solicitudes:{' '}
          <a href="mailto:matimati.info@gmail.com">matimati.info@gmail.com</a>.
        </p>
        <h3>Jugar sin cuenta</h3>
        <p>
          No recopilamos ningún dato personal. Tu idioma, sonido y bot elegido se guardan solo en tu
          propio navegador.
        </p>
        <h3>Iniciar sesión</h3>
        <p>
          Las cuentas usan «Continuar con Google» a través de Firebase Authentication, un servicio de
          Google. Para iniciar tu sesión, Firebase recibe el correo, el nombre y la foto de tu cuenta
          de Google. Solo los usamos para iniciar tu sesión: no mostramos tu nombre ni tu foto, y
          nunca te enviamos correos.
        </p>
        <h3>Qué guardamos</h3>
        <p>
          El apodo que elijas, tus estadísticas de juego (partidas jugadas y ganadas contra bots en
          cada modo) y la fecha en que creaste tu cuenta. Se guardan en Google Cloud Firestore, en
          centros de datos de la Unión Europea.
        </p>
        <h3>Jugar en línea</h3>
        <p>
          Para jugar en línea sin cuenta, Firebase le da a tu navegador un identificador anónimo
          aleatorio, sin correo ni nombre. Mientras dura una partida en línea guardamos los apodos
          de ambos jugadores, ese identificador o el de tu cuenta, y las jugadas. Tu rival ve tu
          apodo. La partida se elimina cuando ambos jugadores salen, y automáticamente dos días
          después de empezar.
        </p>
        <h3>Lo que nunca hacemos</h3>
        <p>Sin anuncios, sin analíticas, sin rastreo, y nunca vendemos ni compartimos tus datos.</p>
        <h3>Quién puede verlos</h3>
        <p>
          Solo tú, además de tu apodo para tu rival en una partida en línea. Las reglas de seguridad
          impiden que cualquier otra persona lea o cambie tus datos. El equipo de Mati Mati solo
          puede acceder a la base de datos para mantener el servicio.
        </p>
        <h3>Dónde se procesan</h3>
        <p>
          Firebase es operado por Google, así que los datos de inicio de sesión pueden procesarse
          fuera de tu país, incluso en Estados Unidos, bajo las condiciones de protección de datos
          de Google.
        </p>
        <h3>Eliminar tus datos</h3>
        <p>
          Abre <strong>Cuenta → Eliminar mi cuenta</strong> para borrar al instante y para siempre tu
          apodo, tus estadísticas, tus partidas en línea y tu cuenta, o escríbenos y lo haremos por
          ti.
        </p>
        <h3>Menores</h3>
        <p>
          Las cuentas y el juego en línea son para mayores de 13 años. Quienes sean menores pueden
          jugar contra los bots, que no guarda nada sobre ellos.
        </p>
        <h3>Cambios</h3>
        <p>Si esta política cambia, actualizaremos esta página y su fecha.</p>
      </>
    ),
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
    privacy: 'Política de privacidad',
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
      truce: 'Si la pieza que hizo el rescate es capturada justo en el turno siguiente, hay tregua: todas las piezas que participaron en el intercambio vuelven a su base, las demás se quedan donde están y los marcadores vuelven a como estaban antes del intercambio.',
    },
  },
};

const STRINGS: Record<Lang, Strings> = { en, es };

// For code above the LanguageProvider; components use useStrings().
export const stringsFor = (lang: Lang) => STRINGS[lang];

const LanguageContext = createContext<Strings>(en);

export function LanguageProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LanguageContext.Provider value={STRINGS[lang]}>{children}</LanguageContext.Provider>;
}

export const useStrings = () => useContext(LanguageContext);
