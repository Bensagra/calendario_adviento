export type DayContentType = "video" | "image" | "audio" | "text" | "coupon";

export interface CalendarDay {
  day: number;
  title: string;
  subtitle: string;
  type: DayContentType;
  file?: string;
  text?: string;
  unlockDate: string;
}

// Editá acá fechas y textos. Las URLs externas se configuran en public/content/urls.json.
export const days: CalendarDay[] = [
  { day: 1, title: "Antes de que te vayas", subtitle: "Tengo algo para decirte", type: "video", file: "/content/1.mp4", unlockDate: "2026-06-10" },
  { day: 2, title: "Cuando me extrañes", subtitle: "Un pedacito mío para vos", type: "text", text: "No importa cuántos kilómetros haya entre nosotros: seguís siendo mi pensamiento favorito del día. Te extraño un poquito más de lo que admito, y te quiero muchísimo más de lo que puedo escribir.", unlockDate: "2026-06-11" },
  { day: 3, title: "Dale play", subtitle: "Un audio para acompañarte", type: "audio", file: "/content/3.mp3", unlockDate: "2026-06-12" },
  { day: 4, title: "Un recuerdo nuestro", subtitle: "Hay momentos que me quedan guardados", type: "image", file: "/content/4.jpg", unlockDate: "2026-06-13" },
  { day: 5, title: "Una cita pendiente", subtitle: "Para usar apenas vuelvas", type: "coupon", text: "Cupón válido por una salida elegida por vos cuando vuelvas.", unlockDate: "2026-06-14" },
  { day: 6, title: "Para sacarte una sonrisa", subtitle: "Porque me encanta verte feliz", type: "video", file: "/content/6.mp4", unlockDate: "2026-06-15" },
  { day: 7, title: "Una mini carta", subtitle: "Para leerte cerquita, incluso de lejos", type: "text", text: "Estos días sin vos me recuerdan algo muy simple: compartir la vida con vos hace que todo tenga un color más lindo. Gracias por estos tres meses y por todo lo que todavía nos falta vivir.", unlockDate: "2026-06-16" },
  { day: 8, title: "Mi foto favorita", subtitle: "La miro y vuelvo a ese momento", type: "image", file: "/content/8.jpg", unlockDate: "2026-06-17" },
  { day: 9, title: "Mimos reservados", subtitle: "Sin fecha de vencimiento", type: "coupon", text: "Cupón válido por una tarde entera de mimos, abrazos y cero apuro.", unlockDate: "2026-06-18" },
  { day: 10, title: "Mitad del camino", subtitle: "Ya falta un poquito menos", type: "video", file: "/content/10.mp4", unlockDate: "2026-06-19" },
  { day: 11, title: "Lo lindo de nosotros", subtitle: "Una verdad que quería dejarte", type: "text", text: "Me gusta que con vos puedo reírme fuerte, hablar de cualquier cosa y también quedarme en silencio. Me gusta cómo se siente ser nosotros.", unlockDate: "2026-06-20" },
  { day: 12, title: "Cerrá los ojos", subtitle: "Y escuchame un ratito", type: "audio", file: "/content/12.mp3", unlockDate: "2026-06-21" },
  { day: 13, title: "Esta sonrisa", subtitle: "Una de mis vistas preferidas", type: "image", file: "/content/13.jpg", unlockDate: "2026-06-22" },
  { day: 14, title: "Plan sin reloj", subtitle: "Vos, yo y todo el día", type: "coupon", text: "Cupón válido por un día juntos sin mirar la hora y con todos los planes improvisados que quieras.", unlockDate: "2026-06-23" },
  { day: 15, title: "Felices 3 meses", subtitle: "Un video para nuestro día", type: "video", file: "/content/15.mp4", unlockDate: "2026-06-24" },
  { day: 16, title: "10 cosas que amo de vos", subtitle: "Aunque podría escribir cien", type: "text", text: "1. Tu sonrisa.\n2. Cómo me hacés reír.\n3. Tu forma de mirar el mundo.\n4. Tus abrazos.\n5. Tu sensibilidad.\n6. Tu fuerza.\n7. Tus ocurrencias.\n8. Cómo cuidás a quienes querés.\n9. La calma que me das.\n10. Lo feliz que soy cuando estamos juntos.", unlockDate: "2026-06-25" },
  { day: 17, title: "Un momento para repetir", subtitle: "Y crear muchos más", type: "image", file: "/content/17.jpg", unlockDate: "2026-06-26" },
  { day: 18, title: "Cena por mi cuenta", subtitle: "El menú lo elegís vos", type: "coupon", text: "Cupón válido por tu cena favorita, preparada o invitada por mí, con postre incluido.", unlockDate: "2026-06-27" },
  { day: 19, title: "Mañana te veo", subtitle: "No sabés cuánto esperé decir esto", type: "text", text: "Mañana se termina la cuenta. Mañana cambio mensajes por abrazos, audios por tu voz cerquita y esta espera por vos. Prepará ese abrazo porque pienso quedarme ahí un buen rato.", unlockDate: "2026-06-28" },
  { day: 20, title: "Se terminó la espera", subtitle: "Esto recién empieza", type: "video", file: "/content/20.mp4", unlockDate: "2026-06-29" },
];
