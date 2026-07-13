"use client";

import { useState, type CSSProperties } from "react";

const controls = [
  {
    id: "intensity",
    icon: "💪",
    label: "Intensidad",
    color: "#e66874",
    values: ["Suavecito", "Bien fuerte", "Me dejaste sin aire"],
  },
  {
    id: "duration",
    icon: "⏱️",
    label: "Duración",
    color: "#eda85f",
    values: ["10 segundos", "5 minutos", "No te suelto"],
  },
  {
    id: "distance",
    icon: "↔️",
    label: "Distancia permitida",
    color: "#7a9ecc",
    values: ["1 metro", "10 centímetros", "0 centímetros"],
  },
] as const;

function HugMachine({ values, analyzing }: { values: number[]; analyzing: boolean }) {
  const closeness = values.reduce((sum, value) => sum + value, 0) / 6;
  const leftShift = 17 - closeness * 15;
  const rightShift = 17 - closeness * 15;

  return (
    <div className={`relative mx-auto mt-5 h-48 max-w-sm overflow-hidden rounded-[1.75rem] border border-white/80 bg-[radial-gradient(circle_at_50%_35%,#fff8e8_0%,#f8d9d9_52%,#eeb9c1_100%)] shadow-inner ${analyzing ? "hug-machine-analyzing" : ""}`}>
      <div className="absolute inset-x-6 top-5 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.18em] text-[#9b6269]">
        <span>Benyu</span><span className="rounded-full bg-white/55 px-3 py-1">Zona de abrazo</span><span>Danu</span>
      </div>
      <div className="absolute left-1/2 top-[54%] h-px w-36 -translate-x-1/2 border-t-2 border-dashed border-white/75" />
      <span className="absolute left-1/2 top-[46%] -translate-x-1/2 text-3xl opacity-80 hug-lab-heart">♥</span>

      <div className="absolute bottom-4 left-[18%] transition-transform duration-500 ease-out" style={{ transform: `translateX(${leftShift}px)` }}>
        <span className="block text-7xl drop-shadow-md">🧑🏻</span>
        <span className="absolute -right-4 top-8 block origin-left text-4xl transition-transform duration-500" style={{ transform: `rotate(${-12 - values[0] * 10}deg)` }}>🫲🏻</span>
      </div>
      <div className="absolute bottom-4 right-[18%] transition-transform duration-500 ease-out" style={{ transform: `translateX(-${rightShift}px)` }}>
        <span className="block scale-x-[-1] text-7xl drop-shadow-md">👩🏻</span>
        <span className="absolute -left-4 top-8 block origin-right text-4xl transition-transform duration-500" style={{ transform: `rotate(${12 + values[0] * 10}deg)` }}>🫱🏻</span>
      </div>

      <div className="absolute inset-x-5 bottom-2 flex items-center gap-2">
        <span className="text-[8px] font-black uppercase tracking-wider text-[#9d6970]">Compatibilidad</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/60"><div className="h-full rounded-full bg-[#dc5967] transition-all duration-500" style={{ width: `${35 + closeness * 65}%` }} /></div>
        <span className="text-[9px] font-black text-[#c34e5c]">{Math.round(35 + closeness * 65)}%</span>
      </div>
    </div>
  );
}

export function HugLaboratory() {
  const [values, setValues] = useState([0, 0, 0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [complete, setComplete] = useState(false);

  const updateValue = (index: number, value: number) => {
    setComplete(false);
    setValues((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
  };

  const analyze = () => {
    setAnalyzing(true);
    window.setTimeout(() => {
      setValues([2, 2, 2]);
      setAnalyzing(false);
      setComplete(true);
    }, 1300);
  };

  if (complete) {
    return (
      <section className="relative overflow-hidden rounded-[2rem] border border-[#f3d7b0] bg-[#fffaf0] p-5 shadow-[0_22px_60px_rgba(104,52,62,.16)] sm:p-8 hug-certificate-in">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border-[28px] border-[#e66a76]/10" />
        <div className="relative rounded-[1.5rem] border-2 border-dashed border-[#dba66a] bg-white/75 px-5 py-7 text-center">
          <span className="inline-flex rounded-full bg-[#284c5b] px-4 py-2 text-[9px] font-black uppercase tracking-[0.22em] text-white">Laboratorio Benyu · Certificado Nº 017</span>
          <p className="mt-5 text-5xl hug-lab-heart">♥</p>
          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.25em] text-[#b27848]">Resultado oficial</p>
          <h3 className="font-display mt-2 text-4xl font-semibold leading-none text-[#54383d]">Abrazo perfectamente calibrado</h3>

          <div className="mx-auto mt-6 max-w-sm divide-y divide-[#ecdcc7] text-left">
            {[
              ["Intensidad", "Peligrosamente fuerte"],
              ["Duración", "Indefinida"],
              ["Distancia", "Inexistente"],
              ["Destinataria", "Danu ❤️"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 py-3 text-xs"><span className="font-bold text-[#9b7c70]">{label}</span><strong className="text-right text-[#573f43]">{value}</strong></div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-[#fce8e5] px-4 py-4">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#b4515c]">Fecha de aplicación</p>
            <p className="font-display mt-1 text-2xl font-semibold text-[#cf4f5d]">Viernes 17</p>
          </div>

          <p className="mx-auto mt-5 max-w-md text-sm font-semibold leading-6 text-[#795e63]">
            La simulación salió perfecta, pero hay algo que ninguna máquina puede calcular: lo que voy a sentir cuando por fin te tenga enfrente.
          </p>
          <p className="font-display mt-3 text-xl font-semibold text-[#c84f5c]">Faltan tres días, mi amor ❤️</p>

          <div className="mt-7 flex items-end justify-between text-[9px] font-bold uppercase tracking-wider text-[#aa8c80]">
            <span>Validado por<br/><b className="font-display text-lg normal-case text-[#62474b]">Benyu</b></span>
            <span className="-rotate-6 rounded-full border-2 border-[#df6672] px-3 py-2 text-[#d55461]">Aprobado<br/>con amor</span>
          </div>
        </div>
        <button type="button" onClick={() => setComplete(false)} className="mx-auto mt-5 block text-[10px] font-black uppercase tracking-[0.18em] text-[#9e6268] underline decoration-[#d9a2a8] underline-offset-4">Volver a calibrar</button>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(155deg,#fff9ef_0%,#f9e4df_45%,#efc8cd_100%)] shadow-[0_22px_60px_rgba(104,52,62,.16)]">
      <div className="px-5 pb-7 pt-6 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-white/80 bg-white/60 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#b75460] shadow-sm">Experimento Nº 017</span>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#9a6e72]">Faltan 3 días</span>
        </div>
        <h3 className="font-display mt-5 text-center text-4xl font-semibold leading-none text-[#50353a] sm:text-5xl">Laboratorio del abrazo perfecto</h3>
        <p className="mx-auto mt-3 max-w-md text-center text-sm font-semibold leading-6 text-[#8b656a]">Ajustá los parámetros. La máquina va a comprobar si el abrazo está listo para el reencuentro.</p>

        <HugMachine values={values} analyzing={analyzing} />

        <div className="mt-5 space-y-3">
          {controls.map((control, index) => (
            <div key={control.id} className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black text-[#5d4348]"><span className="mr-2 text-base">{control.icon}</span>{control.label}</p>
                <p className="text-right text-[10px] font-black" style={{ color: control.color }}>{control.values[values[index]]}</p>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="1"
                value={values[index]}
                onChange={(event) => updateValue(index, Number(event.target.value))}
                aria-label={control.label}
                className="hug-lab-slider mt-3 w-full"
                style={{ "--hug-slider-color": control.color } as CSSProperties}
              />
              <div className="mt-1 flex justify-between text-[8px] font-bold text-[#a88b8e]"><span>{control.values[0]}</span><span>{control.values[2]}</span></div>
            </div>
          ))}
        </div>

        <button type="button" disabled={analyzing} onClick={analyze} className="mt-5 w-full rounded-2xl bg-[#d85865] px-5 py-4 text-sm font-black text-white shadow-[0_12px_25px_rgba(190,72,85,.3)] transition hover:-translate-y-0.5 hover:bg-[#c74a57] active:scale-[.98] disabled:cursor-wait disabled:bg-[#9d7378]">
          {analyzing ? "Analizando compatibilidad…" : "Calibrar abrazo definitivo ♥"}
        </button>
      </div>
    </section>
  );
}
