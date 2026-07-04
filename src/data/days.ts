import { SPECIAL_DATE } from "./config";

export type DayContentType = "video" | "image" | "audio" | "text" | "coupon" | "rescue";

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

export type UnlockGameType =
  | "none"
  | "quiz"
  | "password"
  | "choice"
  | "mission"
  | "scratch"
  | "freeText"
  | "puzzle";

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
    title: "Para que escuches mi voz",
    subtitle: "Para cuando quieras escucharme",
    type: "coupon",
    text: "Cupón válido por una llamada larga cuando quieras. Sin límite de temas, sin límite de ‘te extraño’.",
    unlockDate: "2026-07-06",
    unlockGame: {
      type: "mission",
      question: "Para desbloquear este cupón, mandame un audio de 5 segundos diciendo ‘hola, extraño’.",
      buttonText: "Ya lo mandé",
      successMessage: "Perfecto. Cupón desbloqueado ❤️",
    },
  },
  {
    day: 10,
    title: "Mitad del trayecto",
    subtitle: "Mitad cuenta, mitad drama",
    type: "video",
    file: "/content/10.mp4",
    unlockDate: "2026-07-07",
    unlockGame: {
      type: "quiz",
      question: "Si ya pasaron 10 días de 20, ¿qué significa?",
      options: ["Falta muchísimo", "Estamos en la mitad", "Que vos sos dramático", "Las dos últimas"],
      correctAnswer: "Las dos últimas",
      successMessage: "Correcto. Estamos en la mitad y sí, soy dramático.",
    },
  },
  {
    day: 11,
    title: "Planes para cuando vuelvas",
    subtitle: "La lista ya está empezada",
    type: "text",
    text: "Cosas que quiero hacer cuando vuelvas:\n1. Abrazarte mucho.\n2. Escuchar todo lo del viaje.\n3. Comer algo rico juntos.\n4. Ver una peli o salir a caminar.\n5. Decirte en persona cuánto te extrañé.",
    unlockDate: "2026-07-08",
    unlockGame: {
      type: "choice",
      question: "Elegí el primer plan que hacemos cuando vuelvas.",
      options: ["Comer algo rico", "Ver una peli", "Salir a caminar", "Abrazarnos y no hacer nada", "Sorpresa"],
      successMessage: "Anotado. Yo acepto cualquier plan si es con vos.",
    },
  },
  {
    day: 12,
    title: "Audio para dormir",
    subtitle: "Para bajar un cambio",
    type: "audio",
    file: "/content/12.mp3",
    unlockDate: "2026-07-09",
    unlockGame: {
      type: "choice",
      question: "Antes de desbloquear esto: ¿ya estás lista para relajarte?",
      options: ["Sí", "No, pero lo necesito", "Solo si es con tu voz"],
      successMessage: "Entonces bajá un cambio y escuchá esto ❤️",
    },
  },
  {
    day: 13,
    title: "Faltan pocos días",
    subtitle: "La situación ya es grave",
    type: "image",
    file: "/content/13.jpg",
    unlockDate: "2026-07-10",
    unlockGame: {
      type: "quiz",
      question: "¿Qué pensás que dice el cartel de hoy?",
      options: ["Te extraño", "Faltan pocos días", "Volvé ya", "Estoy oficialmente insoportable"],
      correctAnswer: "Estoy oficialmente insoportable",
      successMessage: "Correcto. La situación ya es grave.",
    },
  },
  {
    day: 14,
    title: "Sorpresa",
    subtitle: "Capaz no todo está acá",
    type: "text",
    text: "Revisá bien. Capaz dejé algo donde menos te lo esperás. Hoy no todo está en la pantalla ❤️",
    unlockDate: "2026-07-11",
    unlockGame: {
      type: "choice",
      question: "Hoy puede haber una sorpresa fuera de la pantalla. ¿Dónde mirarías primero?",
      options: ["Mochila", "Valija", "Neceser", "Bolsillo", "Cartuchera"],
      successMessage: "Buena búsqueda. Capaz hoy no todo está en la pantalla ❤️",
    },
  },
  {
    day: 15,
    title: "Algo muy nuestro",
    subtitle: "Este es especial",
    type: "video",
    file: "/content/15.mp4",
    unlockDate: "2026-07-12",
    unlockGame: {
      type: "freeText",
      question: "Para desbloquear este día especial, escribí una palabra que defina estos 3 meses.",
      placeholder: "Una palabra…",
      successMessage: "Me gustó. Ahora abrí esto, que es especial ❤️",
    },
  },
  {
    day: 16,
    title: "10 cosas que me gustan de vos",
    subtitle: "Aunque podría escribir cien",
    type: "text",
    text: "10 cosas que me gustan de vos:\n1. Tu forma de reírte.\n2. Cómo me mirás.\n3. Cómo me hacés sentir.\n4. Que con vos puedo ser yo.\n5. Tu ternura.\n6. Tus mensajes.\n7. Cómo contás las cosas.\n8. Que hacés especial lo simple.\n9. Las ganas que me dan de verte.\n10. Vos, entera.",
    unlockDate: "2026-07-13",
    unlockGame: {
      type: "choice",
      question: "Antes de ver mi lista, elegí 3 cosas que pensás que me gustan de vos.",
      options: ["Tu risa", "Tus ojos", "Tus mensajes", "Cómo me mirás", "Tu forma de ser", "Tus abrazos", "Todo"],
      helperText: "Elegí una opción para seguir. La respuesta real era más fácil.",
      successMessage: "La respuesta real era más fácil: todo.",
    },
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
