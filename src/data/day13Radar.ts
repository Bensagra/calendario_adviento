export interface RadarSignal {
  /** Identificador único. No lo repitas. Si cambiás uno, se reinicia ese hallazgo guardado. */
  id: string;
  /** Posición horizontal dentro del radar, de 8 a 92 aprox. */
  x: number;
  /** Posición vertical dentro del radar, de 8 a 92 aprox. */
  y: number;
  /** Emoji mini para la señal encontrada. */
  emoji: string;
  /** Título corto de la señal. */
  title: string;
  /** Pista que ve mientras todavía no la encontró. */
  hint: string;
  /** Dedicatoria/mensajito que aparece cuando encuentra la señal. */
  dedication: string;
  /**
   * Foto opcional. Guardala en public/content/day13-radar/ y usá una ruta así:
   * "/content/day13-radar/mi-foto.jpg"
   *
   * Tip mobile: ideal fotos livianas, aprox 1000px de ancho o menos.
   * Si dejás photo vacío o el archivo no existe, aparece una tarjetita sin foto.
   */
  photo?: string;
}

export const radarIntro = {
  title: "Radar de señales",
  helper: "Tocá y arrastrá por el radar. Cuando la señal se ponga fuerte, encontrás un mensajito escondido.",
  completionTitle: "Carta final desbloqueada",
  completionMessage: "Encontraste las 4 señales. Ahora sí, abrí la carta grande.",
  finalLetterTitle: "Para leer cuando termines el radar",
  finalLetter: `Mi amor,

Ya van dos semanas sin verte, y este es nuestro segundo Shabat separados. Y aunque sé que Shabat es un momento de pausa, de paz y de conexión, hoy también se siente como un recordatorio enorme de cuánto te extraño.

Porque en Shabat todo baja un poco la velocidad. El mundo se calma, las luces se prenden, la mesa se llena de significado, y uno se conecta con lo importante. Y ahí, en ese silencio más lindo, en ese espacio donde el alma respira, aparecés vos. Estás en mis pensamientos, en mis ganas de abrazarte, en todo lo que me gustaría compartir con vos.

Extraño tu presencia. Extraño tenerte cerca, mirarte, reírme con vos, sentir esa conexión que no necesita demasiadas palabras para entenderse. Aunque estemos lejos, siento que hay algo entre nosotros que sigue encendido, como las velas de Shabat: una luz tranquila, fuerte y hermosa, que acompaña incluso en la distancia.

Este Shabat no estamos juntos, pero de alguna manera te siento conmigo. Te pienso, te extraño y te espero. Espero el momento de volver a abrazarte fuerte, de volver a sentir que todo vuelve a su lugar cuando estás en mis brazos.

Que este Shabat nos encuentre conectados, aunque sea desde lejos. Que nos cuide, que nos acerque y que nos recuerde que extrañarse también es una forma de amar.

Te espero, mi amor.

Tu Benyu

Shabat shalom.`,
};

// Editá este archivo para armar el día 13.
// Agregá todas las señales que quieras. Recomendación: 4 a 7 para que en mobile sea divertido y no eterno.
// Fotos: guardalas en public/content/day13-radar/ con estos nombres:
// foto1.jpg, foto2.jpg, foto3.jpg, foto4.jpg
export const radarSignals: RadarSignal[] = [
  {
    id: "shabat-juntos",
    x: 22,
    y: 28,
    emoji: "🕯️",
    title: "Otro Shabat juntos",
    hint: "Hay una señal de Shabat escondida por el norte del radar.",
    dedication: "No puedo esperar la hora de vivir otro shabat juntos!",
    photo: "/content/day13-radar/foto1.jpg",
  },
  {
    id: "besos-pegadotes",
    x: 74,
    y: 34,
    emoji: "💋",
    title: "Besos pegadotes",
    hint: "Por la derecha aparece una señal bastante besuquera.",
    dedication: "las ganas que tengo de darnos besos abrazadotes, todos pegadotes disfrutando",
    photo: "/content/day13-radar/foto2.jpg",
  },
  {
    id: "mirarnos-a-los-ojos",
    x: 38,
    y: 69,
    emoji: "👀",
    title: "Volver a mirarnos",
    hint: "Abajo del radar hay una señal que mira fijo.",
    dedication: "Volver a mirarnos a los ojos en persona y volver a elegirnos",
    photo: "/content/day13-radar/foto3.jpg",
  },
  {
    id: "abrazotes-corazoncitos",
    x: 82,
    y: 76,
    emoji: "🫂",
    title: "Abrazotes",
    hint: "La última señal está abajo, en una esquina con mucho amor.",
    dedication: "Quiero poder sentir tus abrazotes y como nuestros corazoncitos se conectan y nos damos MUCHO amor",
    photo: "/content/day13-radar/foto4.jpg",
  },
];
