export interface MysteryOption {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

export interface MysteryDoor {
  id: string;
  emoji: string;
  label: string;
  description: string;
}

export interface MysterySequenceItem {
  id: string;
  emoji: string;
  label: string;
  clue: string;
}

export type MysteryStep =
  | {
      id: string;
      type: "wordOrder";
      eyebrow: string;
      title: string;
      briefing: string;
      instruction: string;
      wordBank: string[];
      solution: string[];
      hint: string;
      successMessage: string;
      mistakeMessage: string;
    }
  | {
      id: string;
      type: "symbolSequence";
      eyebrow: string;
      title: string;
      briefing: string;
      instruction: string;
      symbols: MysterySequenceItem[];
      solution: string[];
      hint: string;
      successMessage: string;
      mistakeMessage: string;
    }
  | {
      id: string;
      type: "evidenceChoice";
      eyebrow: string;
      title: string;
      briefing: string;
      instruction: string;
      options: MysteryOption[];
      correctOptionId: string;
      hint: string;
      successMessage: string;
      mistakeMessage: string;
    }
  | {
      id: string;
      type: "codeLock";
      eyebrow: string;
      title: string;
      briefing: string;
      instruction: string;
      displayLabel: string;
      image?: string;
      solution: string;
      hint: string;
      successMessage: string;
      mistakeMessage: string;
    }
  | {
      id: string;
      type: "password";
      eyebrow: string;
      title: string;
      briefing: string;
      instruction: string;
      placeholder: string;
      acceptedAnswers: string[];
      hint: string;
      successMessage: string;
      mistakeMessage: string;
    }
  | {
      id: string;
      type: "doorChoice";
      eyebrow: string;
      title: string;
      briefing: string;
      instruction: string;
      doors: MysteryDoor[];
      correctDoorId: string;
      hint: string;
      successMessage: string;
      mistakeMessage: string;
    };

export interface MysteryCase {
  caseNumber: string;
  title: string;
  subtitle: string;
  introTitle: string;
  intro: string;
  startButton: string;
  monitorLabel: string;
  steps: MysteryStep[];
  final: {
    title: string;
    message: string;
    button: string;
    couponTitle: string;
    coupon: string;
    signature: string;
  };
}

// El caso está encadenado: cada pista resuelta te da el dato que necesitás para la
// siguiente. Ninguna consigna muestra su respuesta; todas se deducen (o se saben
// porque sos Danu). El 22:14 de la intro es una pista falsa a propósito.
export const day14Mystery: MysteryCase = {
  caseNumber: "CASO 14-BNY",
  title: "La desaparición de Benyu",
  subtitle: "Seis evidencias. Una desaparición. Ninguna coincidencia.",
  introTitle: "Expediente confidencial",
  intro:
    "A las 22:14 se perdió toda señal de Benyu. En la escena quedaron un mate todavía tibio, la televisión encendida y una nota destruida con demasiado cuidado como para haber sido un accidente. No hay puertas forzadas ni huellas desconocidas. Quien armó esto quería que una sola persona pudiera seguir el rastro. Desde este momento, no confíes en nada que no puedas demostrar.",
  startButton: "Abrir el expediente",
  monitorLabel: "Estado del caso",
  steps: [
    {
      id: "nota-rota",
      type: "wordOrder",
      eyebrow: "Evidencia 01 · La nota rota",
      title: "Reconstruí la nota",
      briefing:
        "La nota fue cortada palabra por palabra y todos los fragmentos quedaron desordenados. La frase es algo que Benyu necesitaba que encontraras.",
      instruction: "Usá todos los fragmentos para reconstruir el mensaje en el orden correcto.",
      wordBank: ["auxilio", "abrazar", "pidas", "Cuando", "voy", "hasta", "vuelvas", "te", "que", "a"],
      solution: ["Cuando", "vuelvas", "te", "voy", "a", "abrazar", "hasta", "que", "pidas", "auxilio"],
      hint: "Empieza cuando volvés y termina cuando mi abrazo se vuelve peligrosamente largo.",
      successMessage: "Mensaje reconstruido. Al dar vuelta los fragmentos, las marcas forman la silueta de un avión. Dentro del expediente aparece un sobre titulado «Regreso».",
      mistakeMessage: "La reconstrucción todavía no coincide con el mensaje. Usá todas las palabras y releé la frase completa.",
    },
    {
      id: "ruta-regreso",
      type: "symbolSequence",
      eyebrow: "Pista 02 · El viaje de vuelta",
      title: "Ordená el regreso",
      briefing:
        "Dentro del sobre hay cuatro momentos del regreso, pero Benyu los mezcló. Ordenalos como pasarían desde que empieza el viaje hasta que por fin nos vemos.",
      instruction: "Tocá los cuatro momentos en el orden correcto.",
      symbols: [
        {
          id: "sello",
          emoji: "🛂",
          label: "Control de pasaporte",
          clue: "Hay que pasarlo antes de buscar la valija.",
        },
        {
          id: "mensaje",
          emoji: "🤗",
          label: "Abrazo con Benyu",
          clue: "El mejor momento siempre queda para el final.",
        },
        {
          id: "pasaje",
          emoji: "🎫",
          label: "Pase de abordar",
          clue: "Con esto empieza el viaje de vuelta.",
        },
        {
          id: "equipaje",
          emoji: "🧳",
          label: "Buscar la valija",
          clue: "Sucede después del control y antes de salir.",
        },
      ],
      solution: ["pasaje", "sello", "equipaje", "mensaje"],
      hint: "Primero subís al avión y al final me abrazás. Solo falta ordenar lo del medio.",
      successMessage: "¡Ruta correcta! Entre los papeles aparece una nueva pista: «Buscá al objeto que marca la hora sin poder hablar».",
      mistakeMessage: "Ese viaje quedó medio raro. Pensá qué hacés primero al volver y qué dejás para el final.",
    },
    {
      id: "testigo-silencioso",
      type: "evidenceChoice",
      eyebrow: "Pista 03 · El testigo silencioso",
      title: "¿Quién marca la hora?",
      briefing:
        "Hay cuatro objetos sospechosos. Solo uno puede marcar una hora exacta sin decir una palabra.",
      instruction: "Elegí el objeto correcto.",
      options: [
        {
          id: "ticket",
          emoji: "🎟️",
          title: "Ticket de cine",
          description: "Guarda la fecha de una salida, aunque la tinta está borroneada.",
        },
        {
          id: "valija",
          emoji: "🧳",
          title: "Valija",
          description: "Puede viajar. Está vacía y conserva olor a perfume.",
        },
        {
          id: "reloj",
          emoji: "⏰",
          title: "Reloj de pared",
          description: "Está detenido, sin batería y con el vidrio marcado.",
        },
        {
          id: "mapa",
          emoji: "🗺️",
          title: "Mapa doblado",
          description: "Señala lugares y tiene varias rutas dibujadas.",
        },
      ],
      correctOptionId: "reloj",
      hint: "Tiene agujas, pero no cose.",
      successMessage: "¡Testigo encontrado! Detrás del reloj había una caja con un código de cuatro números.",
      mistakeMessage: "Ese objeto no puede marcar la hora. Probá con otro sospechoso.",
    },
    {
      id: "candado-fecha",
      type: "codeLock",
      eyebrow: "Pista 04 · La foto escondida",
      title: "Encontrá nuestra fecha",
      briefing:
        "Detrás del reloj aparece una foto nuestra. Benyu dejó la clave escrita en algún lugar de la imagen, pero hay que mirar con atención para encontrarla.",
      instruction: "Encontrá la fecha escondida e ingresala como cuatro números, sin la barra.",
      displayLabel: "FECHA ESCONDIDA",
      image: "/content/day14-anniversary-clue.png",
      solution: "2103",
      hint: "Mirá con atención la ventanilla que está detrás de Benyu.",
      successMessage: "¡21 de marzo! La fecha en la que empezó lo nuestro abrió la caja. Adentro hay un grabador que quiere comprobar que realmente sos Danu.",
      mistakeMessage: "Esa no es nuestra fecha. Volvé a revisar todos los rincones de la foto.",
    },
    {
      id: "verificacion-danu",
      type: "password",
      eyebrow: "Pista 05 · Control de identidad",
      title: "Completá la firma",
      briefing:
        "El grabador pregunta cómo firmó Benyu la primera carta de este calendario.",
      instruction: "Completá la firma: «Tu Benyu. ________.»",
      placeholder: "Tu respuesta…",
      acceptedAnswers: [
        "solo tuyo",
        "solamente tuyo",
      ],
      hint: "Son dos palabras. La segunda es «tuyo».",
      successMessage: "¡Identidad confirmada! El grabador revela el último lugar donde podría estar Benyu.",
      mistakeMessage: "Esa no era la firma. Volvé a pensar cómo termina la primera carta.",
    },
    {
      id: "escondite-final",
      type: "doorChoice",
      eyebrow: "Pista 06 · El escondite final",
      title: "¿Dónde está Benyu?",
      briefing:
        "Último mensaje: «Estoy en un lugar que viaja siempre con vos, no ocupa espacio en la valija y está lleno de amor».",
      instruction: "Elegí mi escondite.",
      doors: [
        {
          id: "aeropuerto",
          emoji: "🛫",
          label: "El aeropuerto",
          description: "Puerta de arribos, donde terminan los viajes.",
        },
        {
          id: "corazon",
          emoji: "❤️",
          label: "Tu corazón",
          description: "No necesita llave.",
        },
        {
          id: "valija",
          emoji: "🎒",
          label: "Tu mochila",
          description: "Viaja con vos desde el primer día.",
        },
      ],
      correctDoorId: "corazon",
      hint: "Late y lo tenés adentro tuyo.",
      successMessage: "¡Encontrado! Benyu estuvo con vos todo este tiempo.",
      mistakeMessage: "Ahí no está. Buscá un lugar que siempre viaje con vos.",
    },
  ],
  final: {
    title: "¡Caso resuelto!",
    message:
      "La evidencia cierra: Benyu nunca estuvo desaparecido. Viajó con vos en cada foto, en cada mensaje y en cada vez que miraste cuánto faltaba para volver. La detective Danu acaba de resolver un caso imposible: encontrar a alguien que la distancia nunca pudo llevarse.",
    button: "Cobrar la recompensa",
    couponTitle: "Recompensa oficial del caso",
    coupon:
      "Válido por 1 abrazo largo en la puerta de arribos, el 17/07. Si se extiende más de lo razonable, no se aceptan reclamos.",
    signature: "Caso cerrado · Tu Benyu, solamente tuyo",
  },
};
