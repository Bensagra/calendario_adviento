"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

type Phase = "intro" | "sync" | "distance" | "hug" | "finale";
type PadSide = "left" | "right";

const HOLD_DURATION = 3400;
const MAX_DISTANCE = 12000;

const particles = [
  [7, 0.15, 3.8, 8], [14, 0.9, 4.4, 11], [22, 0.35, 3.5, 7], [31, 1.5, 4.8, 10],
  [40, 0.65, 4.1, 6], [49, 1.15, 3.7, 9], [58, 0.2, 4.7, 7], [66, 1.8, 4.2, 12],
  [75, 0.8, 3.6, 8], [83, 1.35, 4.9, 10], [91, 0.45, 4.3, 7], [96, 1.05, 3.9, 6],
] as const;

function phaseIndex(phase: Phase) {
  if (phase === "distance") return 1;
  if (phase === "hug") return 2;
  if (phase === "finale") return 3;
  return 0;
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

function HeartMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 58" aria-hidden="true" className={className}>
      <path d="M32 55C25 47 5 36 5 18 5 8 12 3 20 3c6 0 10 3 12 8 2-5 6-8 12-8 8 0 15 5 15 15 0 18-20 29-27 37Z" fill="currentColor" />
    </svg>
  );
}

function ProtocolHeader({ phase }: { phase: Phase }) {
  const active = phaseIndex(phase);
  const labels = ["Latidos", "Distancia", "Abrazo"];

  return (
    <header className="relative z-20 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8 sm:pt-7">
      <div className="flex items-center justify-between gap-4 pr-12 sm:pr-14">
        <span className="text-[10px] font-black uppercase tracking-[0.26em] text-[#ff9aa6]">Protocolo 017</span>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#ddc7ce]">Faltan 3 días</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2" aria-label={`Etapa ${Math.min(active + 1, 3)} de 3`}>
        {labels.map((label, index) => {
          const completed = active > index || phase === "finale";
          const current = active === index && phase !== "intro" && phase !== "finale";
          return (
            <div key={label}>
              <span className={`block h-1 overflow-hidden rounded-full bg-white/10 ${current ? "protocol-current-step" : ""}`}>
                <i className={`block h-full rounded-full transition-all duration-700 ${completed || current ? "w-full bg-[#ff6877]" : "w-0"}`} />
              </span>
              <span className={`mt-1.5 block text-[8px] font-bold uppercase tracking-[0.12em] ${completed || current ? "text-[#f4cbd0]" : "text-[#796a74]"}`}>0{index + 1} · {label}</span>
            </div>
          );
        })}
      </div>
    </header>
  );
}

function StageHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="text-center protocol-stage-in">
      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#ff8b98]">{eyebrow}</p>
      <h3 tabIndex={-1} className="font-display mx-auto mt-2 max-w-md text-[2.15rem] font-semibold leading-[0.95] text-[#fff8f2] outline-none sm:text-5xl">{title}</h3>
      <p className="mx-auto mt-3 max-w-sm text-xs font-semibold leading-5 text-[#c8afb8] sm:text-sm sm:leading-6">{children}</p>
    </div>
  );
}

function IntroStage({ onStart }: { onStart: () => void }) {
  return (
    <div className="protocol-stage-in flex min-h-[540px] flex-col justify-between px-5 pb-6 pt-8 sm:min-h-[620px] sm:px-8 sm:pb-8">
      <div className="text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#ff9aa6]">Acceso privado · Danu solamente</p>
        <h3 className="font-display mx-auto mt-4 max-w-lg text-5xl font-semibold leading-[0.9] text-[#fff8f2] sm:text-6xl">Operación:<br/><span className="text-[#ff7b89]">volver a vos</span></h3>
        <p className="mx-auto mt-5 max-w-sm text-sm font-semibold leading-6 text-[#cbb5bd]">Tres módulos. Dos corazones.<br/>Cero centímetros al final.</p>
      </div>

      <div className="protocol-reactor relative mx-auto my-5 flex h-48 w-48 items-center justify-center sm:h-56 sm:w-56">
        <span className="protocol-orbit protocol-orbit-one absolute inset-2 rounded-full border border-[#ff8491]/25"><i /></span>
        <span className="protocol-orbit protocol-orbit-two absolute inset-7 rounded-full border border-dashed border-[#ffc477]/20"><i /></span>
        <span className="absolute inset-[3.5rem] rounded-full bg-[#ff6373]/15 blur-xl" />
        <span className="protocol-main-heart relative flex h-24 w-24 items-center justify-center rounded-full border border-[#ff919c]/35 bg-[#2a1625] shadow-[0_0_60px_rgba(255,104,119,.3)]">
          <HeartMark className="h-11 w-12 text-[#ff6877]" />
        </span>
        <span className="absolute -left-8 top-1/2 rounded-xl border border-white/10 bg-[#1c121d]/90 px-3 py-2 text-left shadow-xl backdrop-blur">
          <small className="block text-[7px] font-black uppercase tracking-widest text-[#88737d]">Origen</small>
          <b className="mt-0.5 block text-[10px] text-[#f1dce1]">DANU · ISR</b>
        </span>
        <span className="absolute -right-8 top-1/2 rounded-xl border border-white/10 bg-[#1c121d]/90 px-3 py-2 text-right shadow-xl backdrop-blur">
          <small className="block text-[7px] font-black uppercase tracking-widest text-[#88737d]">Destino</small>
          <b className="mt-0.5 block text-[10px] text-[#f1dce1]">BENYU · BUE</b>
        </span>
      </div>

      <div>
        <button type="button" onClick={onStart} className="protocol-primary-button group w-full rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8c98]">
          <span>Iniciar protocolo</span><span className="ml-3 inline-block transition-transform group-hover:translate-x-1">→</span>
        </button>
        <p className="mt-3 text-center text-[9px] font-bold uppercase tracking-[0.14em] text-[#74636d]">Conexión cifrada de corazón a corazón</p>
      </div>
    </div>
  );
}

function SyncStage({ count, pulseKey, onBeat, onContinue }: { count: number; pulseKey: number; onBeat: () => void; onContinue: () => void }) {
  const complete = count === 3;

  return (
    <div className="flex min-h-[540px] flex-col px-5 pb-6 pt-7 sm:min-h-[620px] sm:px-8 sm:pb-8">
      <StageHeading eyebrow="Módulo 01 · Sincronización" title="Dos corazones. Un mismo apuro.">Tocá el núcleo tres veces. Un latido por cada día que falta.</StageHeading>

      <div className="relative mx-auto mt-6 flex w-full max-w-md flex-1 flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#160f19]/65 px-4 py-5 shadow-inner">
        <div className="absolute inset-0 protocol-fine-grid opacity-40" />
        <div className="relative flex w-full items-center justify-between px-3 sm:px-8">
          <div className="text-center"><span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#9b7b89]/30 bg-[#251923] text-sm font-black text-[#dfcbd2]">D</span><small className="mt-2 block text-[8px] font-black tracking-widest text-[#86717a]">DANU</small></div>
          <svg viewBox="0 0 220 52" className="mx-2 h-14 min-w-0 flex-1 overflow-visible" aria-hidden="true">
            <path d="M2 28h48l9-18 13 36 13-26 9 8h124" fill="none" stroke="#4b3542" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 28h48l9-18 13 36 13-26 9 8h124" fill="none" stroke="#ff6e7d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" pathLength="100" strokeDasharray={`${count * 33.4} 100`} className="transition-[stroke-dasharray] duration-700" />
          </svg>
          <div className="text-center"><span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#ff7d8b]/35 bg-[#3a1c2b] text-sm font-black text-[#ff8995]">B</span><small className="mt-2 block text-[8px] font-black tracking-widest text-[#a17d88]">BENYU</small></div>
        </div>

        <button
          type="button"
          onClick={onBeat}
          disabled={complete}
          aria-label={complete ? "Corazones sincronizados" : `Registrar latido ${count + 1} de 3`}
          className="relative mt-5 flex h-36 w-36 touch-manipulation items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#ff9ca6] focus-visible:ring-offset-4 focus-visible:ring-offset-[#160f19] disabled:cursor-default sm:h-40 sm:w-40"
        >
          <span className="protocol-beat-ring absolute inset-0 rounded-full border border-[#ff7785]/35" />
          <span className="protocol-beat-ring protocol-beat-ring-delay absolute inset-4 rounded-full border border-[#ff9aa4]/25" />
          <span key={pulseKey} className={`relative flex h-24 w-24 items-center justify-center rounded-full border shadow-[0_0_45px_rgba(255,104,119,.32)] ${complete ? "protocol-sync-complete border-[#ffc477]/50 bg-[#41212d]" : "protocol-tap-heart border-[#ff8190]/35 bg-[#2d1827]"}`}>
            {complete ? <span className="text-4xl text-[#ffc477]">✓</span> : <HeartMark className="h-11 w-12 text-[#ff6877]" />}
          </span>
        </button>

        <div className="relative mt-4 flex items-center gap-2" aria-label={`${count} de 3 latidos registrados`}>
          {[0, 1, 2].map((beat) => <span key={beat} className={`h-2 rounded-full transition-all duration-500 ${beat < count ? "w-8 bg-[#ff6c7a] shadow-[0_0_12px_rgba(255,108,122,.5)]" : "w-2 bg-[#4d3944]"}`} />)}
        </div>
        <p className={`relative mt-3 min-h-5 text-center text-[10px] font-black uppercase tracking-[0.16em] ${complete ? "text-[#ffc477]" : "text-[#9d858e]"}`}>{complete ? "Señal en fase · 100%" : "Tocá al ritmo del corazón"}</p>
      </div>

      {complete ? (
        <div className="mt-4 protocol-stage-in">
          <p className="mb-3 text-center text-xs font-semibold text-[#ddc3cb]">Así estamos hace rato. La máquina recién se enteró.</p>
          <button type="button" onClick={onContinue} className="protocol-primary-button w-full rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-white">Eliminar la distancia →</button>
        </div>
      ) : <p className="mt-4 text-center text-[9px] font-bold uppercase tracking-[0.16em] text-[#77656e]">01 / 03</p>}
    </div>
  );
}

function formatDistance(progress: number) {
  if (progress >= 100) return "0 cm";
  const remaining = Math.round(MAX_DISTANCE * (1 - progress / 100));
  if (progress === 0) return "≈12.000 km";
  if (remaining < 1) return "10 cm";
  if (remaining < 10) return `${remaining * 100} m`;
  return `${remaining.toLocaleString("es-AR")} km`;
}

function DistanceStage({ progress, onChange, onContinue }: { progress: number; onChange: (value: number) => void; onContinue: () => void }) {
  const complete = progress >= 100;
  const distance = formatDistance(progress);
  const status = progress < 30 ? "Señal localizada" : progress < 65 ? "Atravesando la distancia" : progress < 92 ? "Entrando en zona de abrazo" : complete ? "Distancia emocional eliminada" : "Casi ahí…";
  const rangeStyle = { "--protocol-progress": `${progress}%` } as CSSProperties;

  return (
    <div className="flex min-h-[540px] flex-col px-5 pb-6 pt-7 sm:min-h-[620px] sm:px-8 sm:pb-8">
      <StageHeading eyebrow="Módulo 02 · Distancia" title="Demasiados kilómetros. Una sola dirección.">Arrastrá la señal de Danu hasta donde siempre termina: conmigo.</StageHeading>

      <div className={`relative mx-auto mt-6 flex w-full max-w-md flex-1 flex-col justify-center overflow-hidden rounded-[1.75rem] border bg-[#140f18]/75 px-5 py-6 shadow-inner transition-colors duration-700 ${complete ? "border-[#ffc477]/30" : "border-white/[0.08]"}`}>
        <div className="absolute inset-0 protocol-space-field opacity-55" />
        <div className="relative text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8f7882]">Distancia restante</p>
          <p className={`mt-1 font-sans text-5xl font-light tabular-nums tracking-[-0.06em] transition-colors sm:text-6xl ${complete ? "text-[#ffc477]" : "text-[#fff4ef]"}`}>{distance}</p>
          <p className={`mt-2 text-[9px] font-black uppercase tracking-[0.18em] ${complete ? "text-[#ffc477]" : "text-[#ff8995]"}`}>{status}</p>
        </div>

        <div className="relative mx-auto mt-8 w-full max-w-sm py-9">
          <div className="absolute inset-x-5 top-1/2 h-px -translate-y-1/2 bg-[#493642]">
            <span className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#ff6877] to-[#ffc477] shadow-[0_0_12px_rgba(255,104,119,.45)]" style={{ width: `${progress}%` }} />
          </div>
          <div className="absolute left-0 top-1/2 flex -translate-y-1/2 flex-col items-center"><span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ff7482]/30 bg-[#351b29] text-xs font-black text-[#ff8b97] shadow-lg">D</span><small className="mt-2 text-[7px] font-black tracking-widest text-[#9a8089]">ISRAEL</small></div>
          <div className={`absolute right-0 top-1/2 flex -translate-y-1/2 flex-col items-center ${complete ? "protocol-destination-hit" : ""}`}><span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ffc477]/30 bg-[#33231f] text-xs font-black text-[#ffc477] shadow-lg">B</span><small className="mt-2 text-[7px] font-black tracking-widest text-[#9a8089]">B. AIRES</small></div>
          <span className="pointer-events-none absolute top-1/2 z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 rotate-45 items-center justify-center rounded-md border border-white/20 bg-[#ff6c79] shadow-[0_0_20px_rgba(255,104,119,.6)]" style={{ left: `calc(2.75rem + (100% - 5.5rem) * ${progress / 100})` }}><i className="h-2.5 w-2.5 rounded-sm bg-white/90" /></span>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(event) => onChange(Number(event.target.value))}
            aria-label="Reducir la distancia entre Danu y Benyu"
            aria-valuetext={`${distance} restantes`}
            className="protocol-distance-range absolute inset-x-11 top-1/2 z-20 h-14 -translate-y-1/2 cursor-grab touch-pan-y opacity-0 active:cursor-grabbing"
          />
        </div>

        <div className="relative mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
          <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.14em] text-[#88727b]"><span>Danu</span><span>Benyu</span></div>
          <div className="protocol-distance-track mt-2 h-2 overflow-hidden rounded-full bg-[#352732]" style={rangeStyle}><i className="block h-full rounded-full bg-gradient-to-r from-[#ff6373] to-[#ffc477]" style={{ width: `${progress}%` }} /></div>
          <p className="mt-3 text-center text-[10px] font-bold text-[#b9a0aa]">{complete ? "Próximo destino: mis brazos." : "Deslizá el punto de luz hacia Benyu →"}</p>
        </div>
      </div>

      {complete ? <button type="button" onClick={onContinue} className="protocol-primary-button mt-4 w-full rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-white">Cargar el abrazo →</button> : <p className="mt-4 text-center text-[9px] font-bold uppercase tracking-[0.16em] text-[#77656e]">02 / 03</p>}
    </div>
  );
}

type HugStageProps = {
  progress: number;
  activePads: Record<PadSide, boolean>;
  singleFinger: boolean;
  message: string;
  onPadDown: (side: PadSide, event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPadEnd: (side: PadSide, event: ReactPointerEvent<HTMLButtonElement>) => void;
  onSingleDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onSingleEnd: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onToggleMode: () => void;
};

function HugStage({ progress, activePads, singleFinger, message, onPadDown, onPadEnd, onSingleDown, onSingleEnd, onToggleMode }: HugStageProps) {
  const status = progress === 0 ? "Esperando a Danu…" : progress < 28 ? "Detectando tus manos…" : progress < 58 ? "Acercando…" : progress < 84 ? "Abrazo Benyu…" : progress < 100 ? "No te suelto…" : "Abrazo cargado";
  const seconds = Math.max(0, (HOLD_DURATION * (1 - progress / 100)) / 1000).toFixed(1);
  const warmthStyle = { "--protocol-hug-progress": progress / 100 } as CSSProperties;

  return (
    <div className="flex min-h-[540px] flex-col px-5 pb-5 pt-7 sm:min-h-[620px] sm:px-8 sm:pb-8" style={warmthStyle}>
      <StageHeading eyebrow="Módulo 03 · Carga de abrazo" title="Esto necesita las dos manos.">{singleFinger ? "Mantené presionado el núcleo y no me sueltes." : "Apoyá un pulgar en cada huella y no me sueltes."}</StageHeading>

      <div className="protocol-hug-chamber relative mx-auto mt-5 flex w-full max-w-md flex-1 flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/[0.08] px-4 py-5 shadow-inner">
        <div className="absolute inset-0 protocol-fine-grid opacity-25" />
        <div className="relative flex h-40 w-40 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-[#ff8190]/20" />
          <span className="absolute inset-3 rounded-full border border-dashed border-[#ffb0b8]/20 protocol-hug-orbit" />
          <span className="absolute inset-8 rounded-full bg-[#ff6373]/15 blur-xl" />
          <span className="relative flex h-24 w-24 items-center justify-center rounded-full shadow-[0_0_45px_rgba(255,99,115,.3)]" style={{ background: `conic-gradient(#ff6877 ${progress * 3.6}deg, #392630 0deg)` }}>
            <span className="flex h-[5.15rem] w-[5.15rem] items-center justify-center rounded-full bg-[#21151f]"><HeartMark className={`h-10 w-11 text-[#ff6b79] ${progress > 0 ? "protocol-held-heart" : ""}`} /></span>
          </span>
        </div>
        <p className="relative mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#ff9aa5]" aria-live="polite">{status}</p>
        <p className="relative mt-1 font-mono text-[10px] tabular-nums text-[#85717a]">{progress > 0 && progress < 100 ? `${seconds}s` : "CARGA · 0—100%"}</p>

        {singleFinger ? (
          <button
            type="button"
            onPointerDown={onSingleDown}
            onPointerUp={onSingleEnd}
            onPointerCancel={onSingleEnd}
            onLostPointerCapture={onSingleEnd}
            onKeyDown={(event) => { if ((event.key === " " || event.key === "Enter") && !event.repeat) onSingleDown(event as unknown as ReactPointerEvent<HTMLButtonElement>); }}
            onKeyUp={(event) => { if (event.key === " " || event.key === "Enter") onSingleEnd(event as unknown as ReactPointerEvent<HTMLButtonElement>); }}
            className={`relative mt-5 flex min-h-24 w-full touch-none select-none items-center justify-center rounded-2xl border px-4 text-center outline-none transition focus-visible:ring-2 focus-visible:ring-[#ff9aa5] ${progress > 0 ? "border-[#ff7d89]/60 bg-[#ff6877]/15 text-[#ffd5da]" : "border-white/10 bg-white/[0.04] text-[#aa909a]"}`}
          >
            <span><b className="block text-xs uppercase tracking-[0.14em]">Mantené presionado</b><small className="mt-1 block text-[9px] font-bold">con el dedo, mouse o barra espaciadora</small></span>
          </button>
        ) : (
          <div className="relative mt-5 grid w-full grid-cols-2 gap-3">
            {(["left", "right"] as const).map((side) => (
              <button
                type="button"
                key={side}
                onPointerDown={(event) => onPadDown(side, event)}
                onPointerUp={(event) => onPadEnd(side, event)}
                onPointerCancel={(event) => onPadEnd(side, event)}
                onLostPointerCapture={(event) => onPadEnd(side, event)}
                className={`protocol-thumb-pad relative flex min-h-28 touch-none select-none flex-col items-center justify-center overflow-hidden rounded-2xl border outline-none transition focus-visible:ring-2 focus-visible:ring-[#ff9aa5] ${activePads[side] ? "protocol-thumb-active border-[#ff8793]/65 bg-[#ff6877]/15" : "border-white/10 bg-white/[0.035]"}`}
                aria-label={`Apoyar pulgar ${side === "left" ? "izquierdo" : "derecho"}`}
              >
                <span className="protocol-fingerprint" aria-hidden="true"><i/><i/><i/><i/></span>
                <span className={`mt-2 text-[8px] font-black uppercase tracking-[0.16em] ${activePads[side] ? "text-[#ffadb5]" : "text-[#806b74]"}`}>{side === "left" ? "Pulgar izquierdo" : "Pulgar derecho"}</span>
              </button>
            ))}
          </div>
        )}

        <p className={`relative mt-3 min-h-4 text-center text-[9px] font-bold ${message ? "text-[#ffc477]" : "text-[#7e6a73]"}`}>{message || (singleFinger ? "No sueltes hasta llegar al 100%." : "El abrazo empieza cuando detecte los dos pulgares.")}</p>
      </div>

      <button type="button" onClick={onToggleMode} className="mx-auto mt-3 min-h-8 px-3 text-[9px] font-black uppercase tracking-[0.13em] text-[#9f858f] underline decoration-[#68545d] underline-offset-4">{singleFinger ? "Usar dos pulgares" : "Usar modo de un dedo"}</button>
      <p className="text-center text-[9px] font-bold uppercase tracking-[0.16em] text-[#77656e]">03 / 03</p>
    </div>
  );
}

function FinaleStage({ emergencyOpen, onEmergency, onReplay }: { emergencyOpen: boolean; onEmergency: () => void; onReplay: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <div className="protocol-finale relative min-h-[650px] overflow-hidden px-5 pb-7 pt-7 text-center sm:min-h-[720px] sm:px-8 sm:pb-9">
      <div className="absolute inset-0 protocol-finale-rays" />
      {particles.map(([left, delay, duration, size], index) => <i key={index} className="protocol-love-particle absolute bottom-[-10%] text-[#ff8390]" style={{ left: `${left}%`, animationDelay: `${delay}s`, animationDuration: `${duration}s`, width: size, height: size }}><HeartMark className="h-full w-full" /></i>)}

      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <span className="protocol-finale-seal flex h-24 w-24 items-center justify-center rounded-full border border-[#ff9da7]/35 bg-white/10 shadow-[0_0_70px_rgba(255,104,119,.35)] backdrop-blur"><span className="text-4xl font-light text-white">✓</span></span>
        <p className="mt-5 text-[9px] font-black uppercase tracking-[0.28em] text-[#ffc1c7]">Protocolo completado</p>
        <h3 ref={titleRef} tabIndex={-1} className="font-display mt-3 text-[2.7rem] font-semibold leading-[0.9] text-white outline-none sm:text-6xl">Ya estamos listos para volver a encontrarnos.</h3>

        <div className="mt-7 grid w-full grid-cols-2 gap-2 text-left">
          {[
            ["Corazones", "Sincronizados"],
            ["Distancia emocional", "0 cm"],
            ["Abrazo", "Cargado al 100%"],
            ["Aplicación presencial", "Viernes 17"],
          ].map(([label, value], index) => (
            <div key={label} className="protocol-result-tile rounded-2xl border border-white/15 bg-white/[0.09] p-3.5 backdrop-blur" style={{ animationDelay: `${0.25 + index * 0.12}s` }}>
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#e5bdc4]">{label}</p>
              <p className="mt-1 text-xs font-black text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="protocol-final-message mt-6 rounded-[1.5rem] border border-white/20 bg-[#fff8f2] px-5 py-5 text-[#5c3d43] shadow-[0_20px_50px_rgba(84,21,37,.28)]">
          <p className="text-sm font-semibold leading-6">La pantalla pudo imitar los latidos, achicar la distancia y cargar el abrazo. Lo único que no puede medir es lo que voy a sentir cuando por fin seas vos la que esté entre mis brazos.</p>
          <p className="font-display mt-3 text-xl font-semibold text-[#ce4f5d]">Te espero del otro lado de estos tres días, Danu. ❤️</p>
        </div>

        <button type="button" onClick={onEmergency} className="mt-5 min-h-11 w-full rounded-xl border border-white/20 bg-white/[0.08] px-4 py-3 text-[9px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-white/[0.14]">{emergencyOpen ? "Abrazo de emergencia activado ♥" : "Necesito un abrazo ahora"}</button>
        {emergencyOpen && <div className="protocol-emergency mt-3 rounded-xl bg-[#401e2b]/80 px-4 py-3 text-xs font-semibold leading-5 text-[#ffe6e9]">Cerrá los ojos y poné una mano en el corazón. Yo estoy del otro lado, extrañándote y esperando exactamente el mismo abrazo.</div>}

        <button type="button" onClick={onReplay} className="mt-5 min-h-9 px-4 text-[9px] font-black uppercase tracking-[0.14em] text-[#f4c5cb] underline decoration-white/25 underline-offset-4">Volver a sentirlo</button>
      </div>
    </div>
  );
}

export function HugLaboratory() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [beatCount, setBeatCount] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);
  const [distanceProgress, setDistanceProgress] = useState(0);
  const [hugProgress, setHugProgress] = useState(0);
  const [activePads, setActivePads] = useState<Record<PadSide, boolean>>({ left: false, right: false });
  const [singleFinger, setSingleFinger] = useState(false);
  const [hugMessage, setHugMessage] = useState("");
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("Protocolo listo para iniciar");

  const audioRef = useRef<AudioContext | null>(null);
  const pointersRef = useRef<Record<PadSide, number | null>>({ left: null, right: null });
  const rafRef = useRef<number | null>(null);
  const holdStartedRef = useRef(false);
  const progressRef = useRef(0);
  const completedRef = useRef(false);
  const hapticStepRef = useRef(0);
  const finaleTimeoutRef = useRef<number | null>(null);
  const distanceMilestoneRef = useRef(0);
  const shellRef = useRef<HTMLElement>(null);

  const getAudio = () => {
    if (typeof window === "undefined") return null;
    if (audioRef.current && audioRef.current.state !== "closed") return audioRef.current;
    const AudioCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return null;
    try {
      audioRef.current = new AudioCtor();
      return audioRef.current;
    } catch {
      return null;
    }
  };

  const playPulse = (celebration = false) => {
    const audio = getAudio();
    if (!audio) return;
    void audio.resume().catch(() => undefined);
    const now = audio.currentTime;
    const tones = celebration ? [392, 523, 659] : [74, 62];
    tones.forEach((frequency, index) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const start = now + index * (celebration ? 0.09 : 0.13);
      oscillator.type = celebration ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(celebration ? 0.055 : 0.11, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + (celebration ? 0.24 : 0.12));
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.28);
    });
  };

  const cancelHold = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    holdStartedRef.current = false;
  };

  const finishHug = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    cancelHold();
    progressRef.current = 100;
    setHugProgress(100);
    setHugMessage("Abrazo cargado al 100%. No te suelto.");
    setAnnouncement("Abrazo cargado al cien por ciento. Protocolo completado.");
    vibrate([45, 55, 80, 55, 140]);
    playPulse(true);
    finaleTimeoutRef.current = window.setTimeout(() => setPhase("finale"), 850);
  };

  const startHold = () => {
    if (holdStartedRef.current || completedRef.current) return;
    holdStartedRef.current = true;
    hapticStepRef.current = 0;
    setHugMessage("Quedate ahí. El abrazo se está cargando…");
    const startedAt = performance.now();

    const tick = (now: number) => {
      const next = Math.min(100, ((now - startedAt) / HOLD_DURATION) * 100);
      progressRef.current = next;
      setHugProgress(next);
      const hapticStep = Math.floor(next / 20);
      if (hapticStep > hapticStepRef.current) {
        hapticStepRef.current = hapticStep;
        vibrate(next >= 99 ? 70 : 18);
        playPulse();
      }
      if (next >= 100) {
        finishHug();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const interruptHold = () => {
    if (!holdStartedRef.current || completedRef.current) return;
    const interruptedAt = Math.round(progressRef.current);
    cancelHold();
    progressRef.current = 0;
    setHugProgress(0);
    setHugMessage(interruptedAt > 5 ? `Abrazo interrumpido en ${interruptedAt}%. Yo tampoco aceptaría uno tan corto.` : "Necesito sentir los dos pulgares al mismo tiempo.");
    setAnnouncement("Abrazo interrumpido. Intentá nuevamente.");
  };

  const handlePadDown = (side: PadSide, event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (pointersRef.current[side] !== null || completedRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current[side] = event.pointerId;
    setActivePads({ left: pointersRef.current.left !== null, right: pointersRef.current.right !== null });
    void getAudio()?.resume().catch(() => undefined);
    vibrate(12);
    if (pointersRef.current.left !== null && pointersRef.current.right !== null) startHold();
  };

  const handlePadEnd = (side: PadSide, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (pointersRef.current[side] !== event.pointerId) return;
    pointersRef.current[side] = null;
    setActivePads({ left: pointersRef.current.left !== null, right: pointersRef.current.right !== null });
    interruptHold();
  };

  const handleSingleDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (completedRef.current || holdStartedRef.current) return;
    if (typeof event.currentTarget.setPointerCapture === "function" && typeof event.pointerId === "number") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    void getAudio()?.resume().catch(() => undefined);
    vibrate(12);
    startHold();
  };

  const handleSingleEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    interruptHold();
  };

  const resetHold = () => {
    cancelHold();
    pointersRef.current = { left: null, right: null };
    completedRef.current = false;
    progressRef.current = 0;
    setHugProgress(0);
    setActivePads({ left: false, right: false });
    setHugMessage("");
  };

  useEffect(() => {
    const stopOnInterruption = () => {
      if (document.hidden || !document.hasFocus()) {
        pointersRef.current = { left: null, right: null };
        setActivePads({ left: false, right: false });
        interruptHold();
      }
    };
    document.addEventListener("visibilitychange", stopOnInterruption);
    window.addEventListener("blur", stopOnInterruption);
    return () => {
      document.removeEventListener("visibilitychange", stopOnInterruption);
      window.removeEventListener("blur", stopOnInterruption);
    };
  });

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (finaleTimeoutRef.current !== null) window.clearTimeout(finaleTimeoutRef.current);
    const audio = audioRef.current;
    if (audio && audio.state !== "closed") void audio.close().catch(() => undefined);
  }, []);

  useEffect(() => {
    shellRef.current?.scrollTo({ top: 0, behavior: "auto" });
    if (phase === "intro") return;
    const focusFrame = window.requestAnimationFrame(() => {
      shellRef.current?.querySelector<HTMLElement>('h3[tabindex="-1"]')?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(focusFrame);
  }, [phase]);

  const startProtocol = () => {
    void getAudio()?.resume().catch(() => undefined);
    playPulse();
    vibrate(16);
    setAnnouncement("Módulo uno. Sincronización de corazones.");
    setPhase("sync");
  };

  const registerBeat = () => {
    if (beatCount >= 3) return;
    const next = beatCount + 1;
    setBeatCount(next);
    setPulseKey((current) => current + 1);
    playPulse(next === 3);
    vibrate(next === 3 ? [30, 45, 70] : 22);
    setAnnouncement(next === 3 ? "Tres latidos. Corazones cien por ciento sincronizados." : `Latido ${next} de 3 registrado.`);
  };

  const updateDistance = (value: number) => {
    const next = value >= 97 ? 100 : value;
    setDistanceProgress(next);
    const milestone = Math.floor(next / 25);
    if (milestone > distanceMilestoneRef.current) {
      distanceMilestoneRef.current = milestone;
      vibrate(next === 100 ? [25, 35, 60] : 12);
      if (next === 100) {
        playPulse(true);
        setAnnouncement("Distancia emocional eliminada. Próximo destino: los brazos de Benyu.");
      }
    }
  };

  const replay = () => {
    if (finaleTimeoutRef.current !== null) window.clearTimeout(finaleTimeoutRef.current);
    setPhase("intro");
    setBeatCount(0);
    setPulseKey(0);
    setDistanceProgress(0);
    distanceMilestoneRef.current = 0;
    setSingleFinger(false);
    setEmergencyOpen(false);
    resetHold();
    setAnnouncement("Protocolo reiniciado.");
  };

  const toggleEmergency = () => {
    setEmergencyOpen((current) => !current);
    if (!emergencyOpen) {
      vibrate([35, 80, 35]);
      playPulse();
    }
  };

  return (
    <section ref={shellRef} className={`protocol-shell relative h-full min-h-[100dvh] overflow-y-auto overscroll-contain text-white sm:min-h-0 ${phase === "finale" ? "protocol-shell-finale" : ""}`}>
      <div className="pointer-events-none absolute inset-0 protocol-ambient" />
      {phase !== "finale" && <ProtocolHeader phase={phase} />}
      <p className="sr-only" aria-live="polite">{announcement}</p>

      <main className="relative z-10">
        {phase === "intro" && <IntroStage onStart={startProtocol} />}
        {phase === "sync" && <SyncStage count={beatCount} pulseKey={pulseKey} onBeat={registerBeat} onContinue={() => { setAnnouncement("Módulo dos. Eliminación de distancia."); setPhase("distance"); }} />}
        {phase === "distance" && <DistanceStage progress={distanceProgress} onChange={updateDistance} onContinue={() => { resetHold(); setAnnouncement("Módulo tres. Carga de abrazo."); setPhase("hug"); }} />}
        {phase === "hug" && <HugStage progress={hugProgress} activePads={activePads} singleFinger={singleFinger} message={hugMessage} onPadDown={handlePadDown} onPadEnd={handlePadEnd} onSingleDown={handleSingleDown} onSingleEnd={handleSingleEnd} onToggleMode={() => { resetHold(); setSingleFinger((current) => !current); }} />}
        {phase === "finale" && <FinaleStage emergencyOpen={emergencyOpen} onEmergency={toggleEmergency} onReplay={replay} />}
      </main>
    </section>
  );
}
