"use client";

import { useState } from "react";

type Forecast = {
  day: string;
  date: string;
  short: string;
  icon: "cloud" | "wind" | "heart" | "storm";
  condition: string;
  description: string;
  temperature: string;
  chance: string;
  chanceLabel: string;
  wind: string;
  visibility: string;
  accent: string;
};

const forecasts: Forecast[] = [
  {
    day: "Hoy",
    date: "13 JUL",
    short: "Extrañitis",
    icon: "cloud",
    condition: "Nubosidad por extrañitis",
    description: "Se mantiene una capa de distancia, con pensamientos tuyos durante todo el día.",
    temperature: "16°",
    chance: "72%",
    chanceLabel: "mensajes",
    wind: "11.247 km",
    visibility: "Alta",
    accent: "#7fc2dc",
  },
  {
    day: "Martes",
    date: "14 JUL",
    short: "Ansiedad",
    icon: "wind",
    condition: "Ráfagas de ansiedad linda",
    description: "El frente empieza a moverse. Se esperan mariposas repentinas y chequeos frecuentes del calendario.",
    temperature: "18°",
    chance: "84%",
    chanceLabel: "mariposas",
    wind: "En aumento",
    visibility: "3 días",
    accent: "#edb56e",
  },
  {
    day: "Miércoles",
    date: "15 JUL",
    short: "Cerquita",
    icon: "heart",
    condition: "Abrazos acercándose",
    description: "La distancia baja rápidamente. Alta presión en el pecho por ganas de tenerte cerquita.",
    temperature: "22°",
    chance: "93%",
    chanceLabel: "abrazos",
    wind: "DNU → BNY",
    visibility: "2 días",
    accent: "#ec8693",
  },
  {
    day: "Jueves",
    date: "16 JUL",
    short: "Alerta",
    icon: "storm",
    condition: "Tormenta de emociones",
    description: "Condiciones inestables en Benyu. Posibles sonrisas involuntarias y dificultad para dormir.",
    temperature: "28°",
    chance: "99%",
    chanceLabel: "impaciencia",
    wind: "Imparable",
    visibility: "1 día",
    accent: "#d85f6c",
  },
];

function WeatherIcon({ type, large = false }: { type: Forecast["icon"]; large?: boolean }) {
  const size = large ? "h-28 w-32" : "h-11 w-12";

  if (type === "heart") {
    return (
      <div className={`relative ${size}`} aria-hidden="true">
        <span className="absolute inset-0 flex items-center justify-center"><i className="not-italic text-6xl drop-shadow-[0_9px_12px_rgba(174,57,78,.25)] reunion-heart">♥</i></span>
        <span className="absolute left-[12%] top-[12%] text-xl text-white">✦</span>
        <span className="absolute right-[5%] top-[30%] text-sm text-white">✦</span>
      </div>
    );
  }

  if (type === "wind") {
    return (
      <svg viewBox="0 0 120 100" className={`${size} overflow-visible drop-shadow-lg`} aria-hidden="true">
        <circle cx="42" cy="37" r="23" fill="#ffd878" />
        <g fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" className="reunion-wind">
          <path d="M12 46h62c19 0 20-25 4-25-8 0-12 5-13 10" />
          <path d="M22 65h72c16 0 16 20 3 20-7 0-10-4-11-8" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 130 105" className={`${size} overflow-visible drop-shadow-lg`} aria-hidden="true">
      {type === "storm" ? <path d="M67 62 49 91h18l-7 22 28-35H70l13-16Z" fill="#ffd867" className="reunion-flash" /> : <circle cx="38" cy="33" r="25" fill="#ffdb78" />}
      <path d="M30 79h66a22 22 0 0 0 0-44 30 30 0 0 0-56-7A26 26 0 0 0 30 79Z" fill={type === "storm" ? "#c7d2df" : "#fff"} />
      {type === "storm" && <path d="M28 89h58" stroke="#91a6bc" strokeWidth="6" strokeLinecap="round" opacity=".65" />}
    </svg>
  );
}

export function ReunionForecast() {
  const [selected, setSelected] = useState(0);
  const [visited, setVisited] = useState<number[]>([0]);
  const [alertOpen, setAlertOpen] = useState(false);
  const active = forecasts[selected];
  const allSeen = visited.length === forecasts.length;

  const selectForecast = (index: number) => {
    setSelected(index);
    setVisited((current) => current.includes(index) ? current : [...current, index]);
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[#c9e7f3]/80 bg-[#eaf7fc] text-[#163849] shadow-[0_22px_60px_rgba(38,100,126,.2)]">
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/45 blur-2xl" />
      <div className="relative bg-[linear-gradient(155deg,#58b9dc_0%,#75c8e2_48%,#b9e3ee_100%)] px-5 pb-6 pt-5 text-white sm:px-8">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-white/40 bg-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] backdrop-blur">Servicio meteorológico del amor</span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold"><i className="h-2 w-2 animate-pulse rounded-full bg-[#ff6f7d]" /> EN VIVO</span>
        </div>

        <div className="mt-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-white/75">Buenos Aires, Argentina</p>
            <p className="mt-1 text-6xl font-light tracking-[-0.07em] sm:text-7xl">{active.temperature}</p>
            <p className="mt-2 max-w-[14rem] text-sm font-black leading-tight sm:max-w-xs sm:text-base">{active.condition}</p>
          </div>
          <WeatherIcon type={active.icon} large />
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/25 bg-[#367f9a]/25 px-4 py-3 backdrop-blur-sm">
          <span className="text-base">🇮🇱</span>
          <span className="relative h-px flex-1 border-t border-dashed border-white/70"><i className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#69bdd8] px-2 text-xs reunion-plane">✈</i></span>
          <span className="text-base">🇦🇷</span>
          <span className="text-[10px] font-black uppercase tracking-wider">4 días</span>
        </div>
      </div>

      <div className="relative px-4 pb-6 sm:px-7">
        <div className="-mt-1 grid grid-cols-4 overflow-hidden rounded-b-2xl bg-white shadow-[0_10px_30px_rgba(36,92,117,.12)]">
          {forecasts.map((forecast, index) => (
            <button
              type="button"
              key={forecast.date}
              onClick={() => selectForecast(index)}
              className={`relative flex min-w-0 flex-col items-center px-1 py-4 transition ${selected === index ? "bg-[#f3fbfe]" : "hover:bg-[#f8fcfd]"}`}
              aria-pressed={selected === index}
            >
              {visited.includes(index) && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#e76c78]" />}
              <span className={`text-[10px] font-black ${selected === index ? "text-[#237d9f]" : "text-[#708c98]"}`}>{forecast.day}</span>
              <WeatherIcon type={forecast.icon} />
              <span className="truncate text-[9px] font-bold text-[#55717d]">{forecast.short}</span>
              {selected === index && <span className="absolute inset-x-3 bottom-0 h-1 rounded-t-full" style={{ backgroundColor: forecast.accent }} />}
            </button>
          ))}
        </div>

        <div key={active.date} className="mt-5 animate-[fade-up_.35s_ease-out] rounded-[1.6rem] border border-white bg-white/80 p-5 shadow-sm backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4c94ad]">{active.day} · {active.date}</p>
              <h3 className="font-display mt-1 text-2xl font-semibold leading-tight text-[#244654]">{active.condition}</h3>
            </div>
            <span className="rounded-xl bg-[#e7f6fb] px-2.5 py-2 text-center text-[9px] font-black uppercase tracking-wide text-[#3f829b]">Sensación<br/><b className="text-sm text-[#d75d6a]">TE EXTRAÑO</b></span>
          </div>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#607b86]">{active.description}</p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-[#edf8fb] p-3"><span className="text-lg">💧</span><p className="mt-1 text-sm font-black text-[#28566a]">{active.chance}</p><p className="truncate text-[9px] font-bold text-[#77919b]">{active.chanceLabel}</p></div>
            <div className="rounded-xl bg-[#edf8fb] p-3"><span className="text-lg">💨</span><p className="mt-1 truncate text-sm font-black text-[#28566a]">{active.wind}</p><p className="text-[9px] font-bold text-[#77919b]">distancia</p></div>
            <div className="rounded-xl bg-[#edf8fb] p-3"><span className="text-lg">👀</span><p className="mt-1 text-sm font-black text-[#28566a]">{active.visibility}</p><p className="text-[9px] font-bold text-[#77919b]">visibilidad</p></div>
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] font-bold text-[#71909d]">
          {allSeen ? "Pronóstico completo. Hay una alerta nueva." : `Revisá los ${forecasts.length - visited.length} días que faltan para emitir la alerta.`}
        </p>
        <button
          type="button"
          disabled={!allSeen}
          onClick={() => setAlertOpen(true)}
          className="mt-2 w-full rounded-2xl bg-[#dd5d6a] px-5 py-4 text-sm font-black text-white shadow-[0_12px_24px_rgba(194,65,79,.25)] transition enabled:hover:-translate-y-0.5 enabled:hover:bg-[#cb4d5a] enabled:active:scale-[.98] disabled:cursor-not-allowed disabled:bg-[#afc5cd] disabled:shadow-none"
        >
          {allSeen ? "⚠ Emitir alerta de reencuentro" : `Pronóstico ${visited.length}/4`}
        </button>
      </div>

      {alertOpen && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#14394b]/75 p-5 backdrop-blur-md reunion-alert-in">
          <div className="w-full max-w-sm overflow-hidden rounded-[1.75rem] bg-white text-center shadow-2xl">
            <div className="bg-[repeating-linear-gradient(135deg,#dc5966_0_12px,#c94b58_12px_24px)] px-5 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-white">Alerta meteorológica especial</div>
            <div className="p-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fff0f1] text-5xl"><span className="reunion-heart">♥</span></div>
              <p className="font-display mt-4 text-3xl font-semibold text-[#3f3035]">Se aproxima Danu</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#755c62]">
                Se esperan abrazos intensos, besos que empezarán aislados y luego serán generalizados, y una probabilidad del 100% de que Benyu no quiera soltarte.
              </p>
              <div className="mt-4 rounded-2xl bg-[#fff4e5] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#aa6740]">Impacto estimado: viernes 17</div>
              <p className="mt-4 font-display text-xl font-semibold text-[#cf5260]">Ya no falta nada, mi amor ❤️</p>
              <button type="button" onClick={() => setAlertOpen(false)} className="mt-5 w-full rounded-xl bg-[#244b5c] px-4 py-3 text-xs font-black uppercase tracking-wider text-white">Volver al pronóstico</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
