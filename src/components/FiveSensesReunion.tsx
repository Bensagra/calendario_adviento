"use client";

import { useState } from "react";

const senses = [
  { emoji: "👀", name: "Vista", prompt: "Lo primero que quiero ver", answer: "Tu sonrisa cuando nos encontremos." },
  { emoji: "👂", name: "Oído", prompt: "Lo primero que quiero escuchar", answer: "Cómo decís mi nombre después de tantos días." },
  { emoji: "✋", name: "Tacto", prompt: "Lo primero que quiero sentir", answer: "Ese abrazo que venimos esperando." },
  { emoji: "👃", name: "Olfato", prompt: "El olor que más extraño", answer: "Ese olorcito tan vos cuando te abrazo." },
  { emoji: "👄", name: "Gusto", prompt: "Lo primero que quiero saborear", answer: "Un beso tuyo… y después algo rico juntos." },
];

function FloatingHead({ person, progress }: { person: "benyu" | "danu"; progress: number }) {
  const isBenyu = person === "benyu";
  const distance = 5 - progress;
  const x = distance * (isBenyu ? -8 : 8);
  const rotation = (distance * (isBenyu ? -2.2 : 2.2)) + (progress === 5 ? (isBenyu ? 7 : -7) : 0);

  return (
    <div
      className="relative z-10 w-[42%] transition-transform duration-700 ease-out"
      style={{ transform: `translateX(${x}px) rotate(${rotation}deg) scale(${0.86 + progress * 0.035})` }}
    >
      {/* Generated from a photo of us, then chroma-keyed into a transparent sticker. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/content/day15-senses/${person}-head.png`}
        alt={isBenyu ? "Cabeza flotante de Benyu" : "Cabeza flotante de Danu"}
        className="w-full select-none object-contain drop-shadow-[0_15px_14px_rgba(91,39,53,0.28)]"
        draggable={false}
      />
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#a34e5b] shadow-sm">
        {isBenyu ? "Benyu" : "Danu"}
      </span>
    </div>
  );
}

export function FiveSensesReunion() {
  const [progress, setProgress] = useState(0);
  const complete = progress === senses.length;
  const active = progress > 0 ? senses[progress - 1] : null;

  const advance = () => {
    if (!complete) setProgress((current) => current + 1);
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-[radial-gradient(circle_at_top,#fff9da_0%,#ffe8e5_44%,#f8cfd3_100%)] shadow-[0_20px_60px_rgba(104,52,62,0.16)]">
      <div className="px-5 pb-7 pt-6 text-center sm:px-8">
        <span className="inline-flex rounded-full border border-white/80 bg-white/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#ba5964] shadow-sm backdrop-blur">
          Faltan 5 días
        </span>
        <h3 className="font-display mt-4 text-4xl font-semibold leading-none text-[#503237] sm:text-5xl">A cinco sentidos de vos</h3>
        <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-6 text-[#8d6268]">
          Activá un sentido por vez. Con cada uno, nuestras caras —muy normales— se acercan un poquito más.
        </p>

        <div className="relative mx-auto mt-5 flex min-h-52 max-w-xl items-center justify-between overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/35 px-2 py-4 sm:min-h-64 sm:px-8">
          <div className="absolute inset-x-10 top-1/2 h-px -translate-y-1/2 border-t-2 border-dashed border-[#d78d96]/45" />
          {[0, 1, 2, 3, 4].map((step) => (
            <span
              key={step}
              className={`absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full transition-all duration-500 ${step < progress ? "scale-125 bg-[#d55764]" : "bg-white/90"}`}
              style={{ left: `${18 + step * 16}%` }}
            />
          ))}
          {complete && <span className="absolute left-1/2 top-[42%] z-20 -translate-x-1/2 animate-bounce text-5xl drop-shadow-md">💋</span>}
          <FloatingHead person="benyu" progress={progress} />
          <FloatingHead person="danu" progress={progress} />
        </div>

        <div className="mt-5 flex justify-center gap-2" aria-label={`${progress} de 5 sentidos activados`}>
          {senses.map((sense, index) => (
            <span
              key={sense.name}
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-lg transition duration-500 ${index < progress ? "scale-105 border-[#d56a73] bg-white shadow-md" : "border-white/70 bg-white/35 grayscale"}`}
            >
              {sense.emoji}
            </span>
          ))}
        </div>

        <div className="mx-auto mt-5 min-h-44 max-w-md rounded-[1.75rem] border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-sm">
          {!active ? (
            <div className="flex h-32 flex-col items-center justify-center">
              <p className="text-4xl">✨</p>
              <p className="mt-3 text-sm font-bold text-[#765158]">Empecemos a achicar la distancia</p>
            </div>
          ) : complete ? (
            <div>
              <p className="text-4xl">❤️</p>
              <p className="font-display mt-2 text-3xl font-semibold text-[#59363d]">Cinco días. Cinco sentidos.</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#7b555c]">
                Una sola cosa en la cabeza: volver a tenerte cerquita. Ya no estoy contando cuánto hace que te fuiste. Estoy contando cuánto falta para verte.
              </p>
              <p className="mt-3 font-bold text-[#c14f5d]">Te amo, Danu. Nos vemos en cinco ❤️</p>
            </div>
          ) : (
            <div key={active.name} className="animate-[fadeIn_.35s_ease-out]">
              <p className="text-4xl">{active.emoji}</p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#c05d68]">{active.name}</p>
              <p className="mt-2 text-sm font-bold text-[#8a6267]">{active.prompt}</p>
              <p className="font-display mt-2 text-2xl font-semibold leading-snug text-[#53343a]">{active.answer}</p>
            </div>
          )}
        </div>

        {!complete ? (
          <button
            type="button"
            onClick={advance}
            className="mt-5 w-full max-w-md rounded-2xl bg-[#d55764] px-5 py-4 text-sm font-black text-white shadow-[0_12px_25px_rgba(190,72,85,0.3)] transition hover:-translate-y-0.5 hover:bg-[#c84a57] active:scale-[0.98]"
          >
            {progress === 0 ? "Activar el primer sentido" : `Activar ${senses[progress].name.toLowerCase()} ${senses[progress].emoji}`}
          </button>
        ) : (
          <button type="button" onClick={() => setProgress(0)} className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-[#a65a63] underline decoration-[#d9a2a8] underline-offset-4">
            Ver otra vez
          </button>
        )}
      </div>
    </section>
  );
}
