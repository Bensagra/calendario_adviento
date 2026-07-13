import { SPECIAL_DATE } from "./config";

export type DayContentType = "video" | "image" | "audio" | "text" | "coupon" | "rescue" | "postcard" | "boardingPass" | "benyuTamagotchi" | "radar" | "mystery" | "fiveSenses" | "reunionForecast";

export interface RescueChallenge {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

export interface RescueGame {
  intro: string;
  challenges: RescueChallenge[];
  completionTitle: string;
  completionMessage: string;
}

export interface PostcardConfig {
  prompt: string;
  defaultPlace: string;
  defaultMessage: string;
  defaultSignature: string;
  shareText: string;
}

export interface BoardingPassConfig {
  passenger: string;
  flight: string;
  route: string;
  gate: string;
  seat: string;
  intro: string;
  finalMessage: string;
}

export type UnlockGameType =
  | "none"
  | "quiz"
  | "password"
  | "choice"
  | "mission"
  | "scratch"
  | "freeText"
  | "puzzle"
  | "timeMachine";

export interface UnlockGame {
  type: UnlockGameType;
  question?: string;
  options?: string[];
  correctAnswer?: string;
  acceptedAnswers?: string[];
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
  helperText?: string;
  /** Foto del rompecabezas (solo cuando type === "puzzle"). Guardala en public/content. */
  image?: string;
  /** Piezas por lado del rompecabezas. 3 = 9 piezas (default), 4 = 16 piezas. */
  gridSize?: number;
  /** Si es true, el juego se vuelve a jugar cada vez que se abre el día (no se recuerda como resuelto). */
  alwaysReplay?: boolean;
}

export interface CalendarDay {
  day: number;
  title: string;
  subtitle: string;
  type: DayContentType;
  file?: string;
  /** Canción de fondo opcional (se reproduce sola) cuando type === "image". */
  audioFile?: string;
  text?: string;
  unlockDate: string;
  unlockGame?: UnlockGame;
  isSpecialDate?: boolean;
  specialLabel?: string;
  /** Si existe, el día queda bloqueado y este mensaje aparece al tocarlo. */
  lockedMessage?: string;
  rescueGame?: RescueGame;
  postcard?: PostcardConfig;
  boardingPass?: BoardingPassConfig;
}

// Editá acá fechas, textos, juegos y premios. Las URLs externas se configuran en public/content/urls.json.
export const days: CalendarDay[] = [
  {
    day: 1,
    title: "Para que no me extrañes tanto",
    subtitle: "Tengo algo para decirte",
    type: "video",
    file: "/content/1.mp4",
    text: "Antes de que te vayas, quería dejarte algo mío para acompañarte. Revisá tu mochila ❤️",
    unlockDate: "2026-06-28",
    unlockGame: { type: "none" },
  },
  {
    day: 2,
    title: "Inicio de una nueva aventura",
    subtitle: "Ya empezó la cuenta",
    type: "text",
    text: "Un viaje se vive tres veces: cuando se lo planea, cuando se lo vive y cuando se lo recuerda. \n Hoy iniciás la segunda etapa de tu viaje: vivirlo. Tal vez sea la etapa más linda, o tal vez esa sea la del recuerdo, cuando inevitablemente maquillamos un poco las cosas. \n La realidad es que hoy estás yendo a Israel, un lugar único en el mundo, donde nuestra historia está escrita, donde nuestras tradiciones están marcadas y donde se siente una esencia única en la Tierra Prometida. \n Este calendario tiene el objetivo de hacerte sentir un poquito más cerca mío, a través de risas, cosas graciosas y cartitas lindas. Esta es la primera, para acompañarte en el inicio de esta aventura y en tu llegada a Israel. \n Te amo demasiado, Danu. Sos una persona muy especial para mí y no puedo esperar a que llegue el momento de vivir tu viaje por tercera vez: el recuerdo. Ese recuerdo que espero que podamos revivir pegaditos, con vos contándome todo y volviendo a disfrutarnos físicamente. \n Te amo. Con todo el cariño del mundo. Tu benyu. Solamente tuyo.",
    unlockDate: "2026-06-29",
    unlockGame: {
      type: "quiz",
      question: "¿Quién está contando los días para volver a verte?",
      options: ["Vos", "Yo", "Los dos", "Nadie"],
      correctAnswer: "Los dos",
      successMessage: "Correcto. Los dos, aunque yo capaz un poquito más ❤️",
    },
  },
  {
    day: 3,
    title: "Siempre me vas a llevar con vos",
    subtitle: "Para escucharme cerquita",
    type: "audio",
    file: "/content/3.m4a",
    unlockDate: "2026-06-30",
    unlockGame: {
      type: "password",
      question: "Para desbloquear el audio, escribí una palabra linda que usemos entre nosotros.",
      acceptedAnswers: ["amor", "mi amor","mi vida", "te quiero", "te amo", "gorda", "gordo"],
      placeholder: "Escribí la palabra…",
      successMessage: "Esa era. Ahora sí, escuchá esto ❤️",
    },
  },
  {
    day: 4,
    title: "La cajita del recuerdo",
    subtitle: "Hay momentos que me quedan guardados para siempre",
    type: "image",
    file: "/content/4.jpg",
    text: "Esta foto no es usual. Nunca la usamos. Es una foto muy nuestra donde creo que cuenta nuestra relación a la perfección. Dos bombones enamorados que disfrutan el uno del otro como nadie. Esa foto fue nuestra primera vez durmiendo juntos, en lo de luz. No me olvido más de como te abrace ese dia. Me encantaría poder hacerlo todas las noches y decirte lo mucho que te amo y lo mega especial que sos para mi. Hoy la vida nos tiene separados físicamente pero unidos sentimentalmente como siempre. El uno para el otro. TE AMO MUCHO DANU.",
    unlockDate: "2026-07-01",
    unlockGame: {
      type: "choice",
      question: "¿Qué tipo de recuerdo querés desbloquear hoy?",
      options: ["Uno tierno", "Uno gracioso", "Uno que me hace extrañarte", "Uno nuestro"],
      successMessage: "Buena elección. Este recuerdo es muy nuestro.",
    },
  },
  {
    day: 5,
    title: "Una canción para vos",
    subtitle: "Hay cosas que se dicen mejor cantando",
    type: "image",
    file: "/content/5.png",
    audioFile: "/content/5.mp3",
    unlockDate: "2026-07-02",
    unlockGame: {
      type: "quiz",
      question: "¿Para quién es esta canción?",
      options: ["Para vos", "Para mí", "Para los dos", "Para nadie"],
      correctAnswer: "Para vos",
      successMessage: "Obvio. Ahora sí, escuchala ❤️",
    },
  },
  {
    day: 6,
    title: "La foto secreta",
    subtitle: "Armá el rompecabezas para leer la carta",
    type: "text",
    text: "Dicen que las piezas de un rompecabezas están hechas para encajar. Pero la vida no funciona así. Caminamos rodeados de millones de piezas que nunca llegan a encontrarse, otras que parecen perfectas pero no coinciden, y algunas que, por más que uno insista, simplemente no pertenecen al mismo lugar. Por eso, cuando dos piezas se encuentran y encajan sin tener que forzarse, no es algo común. Es una de esas casualidades que parecen demasiado precisas para ser solo azar. Y creo que nosotros somos eso: dos piezas que, entre un mundo de posibilidades, terminaron encontrándose exactamente donde debían. Y esta conexión también es representada por el shabat. Shabat… Dia del descanso pero tambien dia de la conexión. Con la familia, con amigos, con dios. Shabat nos permite olvidar todas las otras cosas cotidianas para enfocarnos en lo que importa. Y eso que importa sos vos mi danucha. Ame el primer shabat que compartimos juntos. Este nos toca pasarlo a miles de kilometros pero yo se que como siempre hashem nos va a unir. Porque no es casualidad que nuestras piezas encajaron. Y nosotros estamos destinados a estar unidos. Hoy no será físicamente. Pero yo sé que sentimentalmente vamos a estarlo. Espero que disfrutes el shabaton un montón! Y si en algún momento necesitas hablar conmigo, solo cierra los ojos e imaginate que estas abrazada a mi diciéndome lo que necesites que yo siempre voy a estar ahí para acompañarte. Te amo mucho. Shabat shalom amor de mi vida.",
    unlockDate: "2026-07-03",
    unlockGame: {
      type: "puzzle",
      image: "/content/6.jpg",
      gridSize: 4,
      alwaysReplay: true,
      question: "Armá la foto secreta para desbloquear la carta.",
      helperText: "Tocá una pieza y después otra para intercambiarlas. Cuando la foto quede completa, se abre la carta.",
      successMessage: "¡La armaste! Ahí va la carta ❤️",
    },
  },
  {
    day: 7,
    title: "Hasemer ionero",
    subtitle: "Porque te extraño",
    type: "video",
    file: "/content/7.mp4",
    unlockDate: SPECIAL_DATE,
    isSpecialDate: true,
    specialLabel: "Día especial",
    unlockGame: {
      type: "password",
      question: "Para desbloquear el video, escribí lo que te voy a dar apenas vuelvas. Empieza con ‘a’ y termina con ‘o’.",
      acceptedAnswers: ["abrazo", "un abrazo"],
      placeholder: "Pista: lo vas a reclamar cuando vuelvas",
      successMessage: "Exacto. Ahora mirá esto ❤️",
    },
  },
  {
    day: 8,
    title: "Operación: salvar a Benyu",
    subtitle: "Una semana lejos. Nueve misiones. Un solo rescate.",
    type: "rescue",
    unlockDate: "2026-07-05",
    unlockGame: { type: "none" },
    rescueGame: {
      intro: "Hace una semana que te fuiste y la extrañitis llegó a niveles peligrosos. Completá estas misiones durante el día, en el orden que quieras, para rescatarme.",
      challenges: [
        {
          id: "hebrew-romance",
          emoji: "אה",
          title: "Romance en hebreo",
          description: "Conseguí que alguien te enseñe una frase romántica en hebreo y mandámela.",
        },
        {
          id: "ort-photo",
          emoji: "📸",
          title: "Prueba ORTográfica",
          description: "Mandame por WhatsApp una foto con dos chicos de ORT.",
        },
        {
          id: "secret-kindness",
          emoji: "✨",
          title: "Bondad secreta",
          description: "Hacé una mini buena acción sin decirle a nadie cuál fue.",
        },
        {
          id: "save-benyu-video",
          emoji: "🎬",
          title: "Pedido de auxilio",
          description: "Conseguí que tres personas digan en un video: “¡Salven a Benyu!”.",
        },
        {
          id: "heart-hunt",
          emoji: "❤️",
          title: "Cacería de corazones",
          description: "Encontrá algo con forma de corazón y mandame una foto.",
        },
        {
          id: "love-question",
          emoji: "💬",
          title: "La pregunta del amor",
          description: "Preguntale a alguien qué haría por amor y mandame su respuesta.",
        },
        {
          id: "benyu-pose",
          emoji: "🥸",
          title: "Modo Benyu",
          description: "Sacate una foto imitando una pose mía y mandámela.",
        },
        {
          id: "best-moment",
          emoji: "🎤",
          title: "Reporte del día",
          description: "Mandame un audio de diez segundos contando el mejor momento de tu día.",
        },
        {
          id: "night-selfie",
          emoji: "🌙",
          title: "Prueba de vida nocturna",
          description: "Mandame una selfie a la noche para demostrar que completaste el rescate.",
        },
      ],
      completionTitle: "¡Benyu fue rescatado!",
      completionMessage: "Pasó una semana y, incluso a miles de kilómetros, seguís haciendo que cada día sea más lindo. Gracias por jugar, por elegirme y por salvarme de la extrañitis. Te amo, Danu ❤️",
    },
  },
  {
    day: 9,
    title: "Un mensaje de Benyu del futuro",
    subtitle: "Enviado desde el día en que ya volviste",
    type: "text",
    text: `Hola, Danu.

Vengo del futuro. Hoy es 17 de julio, al mediodía, y estamos abrazadotes. Muy fuerte. Ese abrazo que tanto esperamos, ese que parece detener el tiempo antes de que te vayas a Iona.

Vos estás durmiendo una siestota, y yo estoy acá, mirándote descansar como mi bella durmiente. No puedo evitar sonreír mientras te miro, porque el reencuentro fue hermoso. Te vi salir por esa puerta, nos miramos, y apareció esa sonrisa que siempre nos conecta, esa que no necesita palabras para decirlo todo.

Y entre besotes y abrazos, volviste a mis brazos. A mi cuidado. A mi protección. Pero esta vez con algo distinto: los dos crecimos. Los dos mejoramos. Los dos cambiamos. Y aun así, seguimos encontrándonos en el mismo lugar: en este amor que vuelve a sentirse nuevo, pero con la fuerza de todo lo que ya vivimos.

Hoy siento que estamos reviviendo nuestra relación, dándonos un nuevo comienzo, una nueva oportunidad para disfrutarnos, para elegirnos mejor, para abrazarnos más fuerte y para seguir construyendo esto que tanto amo.

De acá para siempre.

Te amo mucho, mi Danucha.`,
    unlockDate: "2026-07-06",
    unlockGame: {
      type: "timeMachine",
      question: "El mensaje de Benyu quedó atrapado en el tiempo.",
      helperText: "Conseguí nueve corazones para cargar la máquina y traerlo hasta el presente.",
      successMessage: "Viaje completado. Tenés un mensaje de Benyu ❤️",
    },
  },
  {
    day: 10,
    title: "Postal viva desde Israel",
    subtitle: "Armá una postal para que viaje hasta mí",
    type: "postcard",
    unlockDate: "2026-07-07",
    unlockGame: { type: "none" },
    postcard: {
      prompt: "Dejame un pedacito de tu día en formato postal. Yo la recibo como si me llegara desde allá.",
      defaultPlace: "Israel",
      defaultMessage: "Hoy pensé en vos cuando...",
      defaultSignature: "Danu",
      shareText: "Benyu, te mando mi postal viva desde Israel ❤️",
    },
  },
  {
    day: 11,
    title: "Benyu Airlines",
    subtitle: "Check-in a la segunda mitad del viaje",
    type: "boardingPass",
    unlockDate: "2026-07-08",
    unlockGame: { type: "none" },
    boardingPass: {
      passenger: "Danu",
      flight: "DNU-011",
      route: "DNU -> BNY",
      gate: "Abrazo",
      seat: "1A",
      intro: "Ya pasamos la mitad invisible: desde ahora cada día no te aleja del viaje, te acerca al reencuentro.",
      finalMessage: "Check-in completo. A partir de hoy, cada día no se siente como que te fuiste: se siente como que estás volviendo. Seguí juntando historias, fotos y risas. Yo te espero en la puerta de embarque más importante: la del abrazo.",
    },
  },
  {
    day: 12,
    title: "Cuidá a Benyu",
    subtitle: "Un Tamagotchi dramático que tiene que sobrevivir hasta tu vuelta",
    type: "benyuTamagotchi",
    unlockDate: "2026-07-09",
    unlockGame: { type: "none" },
  },
  {
    day: 13,
    title: "Radar de señales",
    subtitle: "Encontrá mensajitos y fotos escondidas",
    type: "radar",
    unlockDate: "2026-07-10",
    unlockGame: { type: "none" },
  },
  {
    day: 14,
    title: "Caso Benyu desaparecido",
    subtitle: "Un misterio romántico para salvar a Benyu",
    type: "mystery",
    unlockDate: "2026-07-11",
    unlockGame: { type: "none" },
  },
  {
    day: 15,
    title: "A cinco sentidos de vos",
    subtitle: "Faltan cinco días para volver a sentirte cerquita",
    type: "fiveSenses",
    unlockDate: "2026-07-12",
    unlockGame: { type: "none" },
  },
  {
    day: 16,
    title: "Pronóstico del reencuentro",
    subtitle: "Se acerca un frente de abrazos desde Israel",
    type: "reunionForecast",
    unlockDate: "2026-07-13",
    unlockGame: { type: "none" },
  },
  {
    day: 17,
    title: "Cuenta regresiva",
    subtitle: "Ya falta muy poquito",
    type: "video",
    file: "/content/17.mp4",
    unlockDate: "2026-07-14",
    unlockGame: {
      type: "quiz",
      question: "Falta poco. ¿Qué voy a hacer apenas te vea?",
      options: ["Saludar normal", "Hacerme el tranquilo", "Abrazarte mucho", "Decir hola y nada más"],
      correctAnswer: "Abrazarte mucho",
      successMessage: "Correcto. Y probablemente no te suelte rápido.",
    },
  },
  {
    day: 18,
    title: "Cupón final",
    subtitle: "Para usar juntos",
    type: "coupon",
    text: "Cupón válido por una tarde completa juntos. Sin apuro, sin interrupciones, con muchos abrazos.",
    unlockDate: "2026-07-15",
    unlockGame: {
      type: "scratch",
      question: "Raspá la tarjeta para descubrir tu cupón.",
      successMessage: "Cupón desbloqueado ❤️",
    },
  },
  {
    day: 19,
    title: "Mañana te veo",
    subtitle: "Por fin falta casi nada",
    type: "text",
    text: "Mañana te veo. Después de tantos días contando cuánto faltaba, por fin falta casi nada. Me encanta que hayas vivido este viaje, pero no sabés las ganas que tengo de abrazarte y escucharte contarme todo.",
    unlockDate: "2026-07-16",
    unlockGame: {
      type: "quiz",
      question: "Mañana nos vemos. ¿Qué emoción desbloqueamos hoy?",
      options: ["Ansiedad linda", "Felicidad", "Ganas de abrazo", "Todas juntas"],
      correctAnswer: "Todas juntas",
      successMessage: "Sí. Todas juntas y cada vez más fuerte.",
    },
  },
  {
    day: 20,
    title: "Se terminó la espera",
    subtitle: "Ahora sí",
    type: "video",
    file: "/content/20.mp4",
    unlockDate: "2026-07-17",
    unlockGame: {
      type: "password",
      question: "Último día. Para desbloquear el final, escribí lo que quiero darte apenas te vea.",
      acceptedAnswers: ["abrazo", "un abrazo", "beso", "un beso", "abrazo y beso", "un abrazo y un beso"],
      placeholder: "Escribí la respuesta…",
      successMessage: "Exacto. Ahora sí, se terminó la espera ❤️",
    },
  },
];
