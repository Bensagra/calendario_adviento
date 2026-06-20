import { SPECIAL_DATE } from "./config";

export type DayContentType = "video" | "image" | "audio" | "text" | "coupon";

export type UnlockGameType =
  | "none"
  | "quiz"
  | "password"
  | "choice"
  | "mission"
  | "scratch"
  | "freeText";

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
}

export interface CalendarDay {
  day: number;
  title: string;
  subtitle: string;
  type: DayContentType;
  file?: string;
  text?: string;
  unlockDate: string;
  unlockGame?: UnlockGame;
  isSpecialDate?: boolean;
  specialLabel?: string;
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
    text: "Si hoy me extrañás aunque sea un poquito, acordate de que yo también estoy pensando en vos. Me encanta que estés viviendo este viaje, pero ya estoy contando cuánto falta para abrazarte.",
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
    file: "/content/3.mp3",
    unlockDate: "2026-06-30",
    unlockGame: {
      type: "password",
      question: "Para desbloquear el audio, escribí una palabra linda que usemos entre nosotros.",
      acceptedAnswers: ["amor", "mi amor", "te quiero", "te amo", "gorda", "gordo"],
      placeholder: "Escribí la palabra…",
      successMessage: "Esa era. Ahora sí, escuchá esto ❤️",
    },
  },
  {
    day: 4,
    title: "La cajita del recuerdo",
    subtitle: "Hay momentos que me quedan guardados",
    type: "image",
    file: "/content/4.jpg",
    text: "Este recuerdo me encanta porque me hace pensar en lo bien que me siento con vos. Hay momentos que parecen simples, pero después se quedan guardados.",
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
    title: "Hasemer ionero",
    subtitle: "Porque te extraño",
    type: "video",
    file: "/content/5.mp4",
    unlockDate: "2026-07-02",
    unlockGame: {
      type: "password",
      question: "Para desbloquear el video, escribí lo que te voy a dar apenas vuelvas. Empieza con ‘a’ y termina con ‘o’.",
      acceptedAnswers: ["abrazo", "un abrazo"],
      placeholder: "Pista: lo vas a reclamar cuando vuelvas",
      successMessage: "Exacto. Ahora mirá esto ❤️",
    },
  },
  {
    day: 6,
    title: "Reporte oficial",
    subtitle: "Estado actual del novio",
    type: "video",
    file: "/content/6.mp4",
    unlockDate: "2026-07-03",
    unlockGame: {
      type: "quiz",
      question: "¿Cuál es mi estado actual sin vos?",
      options: ["Perfectamente normal", "Dramático pero estable", "Insoportable", "Todas las anteriores"],
      correctAnswer: "Todas las anteriores",
      successMessage: "Correcto. Seguimos en estado crítico pero romántico.",
    },
  },
  {
    day: 7,
    title: "Una de tantas cosas que me gustan de vos",
    subtitle: "Un día especial para decirte algo",
    type: "text",
    text: "Una de las cosas que más me gustan de vos es cómo hacés que todo se sienta más lindo. No importa si estamos haciendo algo especial o simplemente hablando, con vos todo tiene algo distinto.",
    unlockDate: SPECIAL_DATE,
    isSpecialDate: true,
    specialLabel: "Día especial",
    unlockGame: {
      type: "freeText",
      question: "Completá esta frase: ‘Cuando vuelva quiero que…’",
      placeholder: "Escribí lo que quieras…",
      successMessage: "Pedido registrado. Veremos qué puede hacer el novio ❤️",
    },
  },
  {
    day: 8,
    title: "Foto secreta",
    subtitle: "Nivel de extrañarte: ridículo",
    type: "image",
    file: "/content/8.jpg",
    text: "Imagen exclusiva de mí intentando hacerme el fuerte mientras vos estás lejos.",
    unlockDate: "2026-07-05",
    unlockGame: {
      type: "quiz",
      question: "¿Cuánto pensás que te estoy extrañando?",
      options: ["Poco", "Normal", "Mucho", "Nivel ridículo"],
      correctAnswer: "Nivel ridículo",
      successMessage: "Sí. Nivel ridículo confirmado.",
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
