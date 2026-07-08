"use client";

import { useEffect, useMemo, useState } from "react";
import { REUNION_DATE } from "@/data/config";
import { HeartIcon, SparkleIcon } from "./icons";

interface PetState {
  food: number;
  love: number;
  energy: number;
  longing: number;
  alive: boolean;
  deaths: number;
  careCount: number;
  createdAt: number;
  lastTickAt: number;
  lastCareAt: number;
  deadAt?: number;
  message: string;
}

interface CareAction {
  id: string;
  label: string;
  emoji: string;
  description: string;
  message: string;
  effect: Partial<Record<"food" | "love" | "energy" | "longing", number>>;
}

type Mood = "happy" | "ok" | "sad" | "critical" | "dead" | "reunited";

const MAX_STAT = 100;
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const WARNING_AFTER = 6 * HOUR;
const DEATH_AFTER = 10 * HOUR;
const STORAGE_VERSION = "v3";
const SOLO_PHOTO = "/content/benyu-tamagotchi.png";
const HAPPY_PHOTO = "/PHOTO-2026-02-27-10-54-40.jpg";
const FALLBACK_PHOTO = "/7d9f5a7d-d887-42a1-8486-62a3498f329b.JPG";

const defaultMessage = "Benyu está vivo, medio intenso, y esperando cuidados.";

const actions: CareAction[] = [
  {
    id: "kiss",
    label: "Darle beso",
    emoji: "💋",
    description: "+ amor, - extrañitis",
    message: "Benyu recibió un beso y dejó de dramatizar un poquito.",
    effect: { love: 18, longing: -14, energy: 2 },
  },
  {
    id: "hug",
    label: "Abrazo virtual",
    emoji: "🫂",
    description: "cura casi todo",
    message: "Abrazo virtual aplicado. Benyu respiró mejor.",
    effect: { love: 24, longing: -24, energy: 5, food: -3 },
  },
  {
    id: "food",
    label: "Darle comida",
    emoji: "🍝",
    description: "+ comida",
    message: "Benyu comió. Ahora puede seguir existiendo con dignidad.",
    effect: { food: 28, love: 4, longing: -3 },
  },
  {
    id: "selfie",
    label: "Mandarle selfie",
    emoji: "📸",
    description: "+ amor, - extrañitis",
    message: "Selfie recibida. Benyu volvió a ser persona.",
    effect: { love: 18, longing: -20, energy: 4 },
  },
  {
    id: "sleep",
    label: "Siestita",
    emoji: "😴",
    description: "+ energía",
    message: "Benyu durmió un rato. Sigue extrañando, pero con batería.",
    effect: { energy: 32, food: -6, longing: 4 },
  },
  {
    id: "promise",
    label: "Ya falta menos",
    emoji: "🗓️",
    description: "- extrañitis",
    message: "Le dijiste que falta menos. Funcionó. No preguntes cómo.",
    effect: { love: 10, longing: -22 },
  },
];

function clamp(value: number) {
  return Math.max(0, Math.min(MAX_STAT, Math.round(value)));
}

function getReunionTime() {
  return new Date(`${REUNION_DATE}T00:00:00`).getTime();
}

function getDefaultState(now = Date.now()): PetState {
  return {
    food: 72,
    love: 72,
    energy: 70,
    longing: 38,
    alive: true,
    deaths: 0,
    careCount: 0,
    createdAt: now,
    lastTickAt: now,
    lastCareAt: now,
    message: defaultMessage,
  };
}

function isPetState(value: unknown): value is Partial<PetState> {
  return Boolean(value && typeof value === "object");
}

function sanitizeState(value: unknown, now = Date.now()) {
  const fallback = getDefaultState(now);
  if (!isPetState(value)) return fallback;

  const numberOr = (candidate: unknown, defaultValue: number) =>
    typeof candidate === "number" && Number.isFinite(candidate) ? candidate : defaultValue;

  return {
    food: clamp(numberOr(value.food, fallback.food)),
    love: clamp(numberOr(value.love, fallback.love)),
    energy: clamp(numberOr(value.energy, fallback.energy)),
    longing: clamp(numberOr(value.longing, fallback.longing)),
    alive: typeof value.alive === "boolean" ? value.alive : fallback.alive,
    deaths: Math.max(0, Math.round(numberOr(value.deaths, fallback.deaths))),
    careCount: Math.max(0, Math.round(numberOr(value.careCount, fallback.careCount))),
    createdAt: numberOr(value.createdAt, fallback.createdAt),
    lastTickAt: numberOr(value.lastTickAt, fallback.lastTickAt),
    lastCareAt: numberOr(value.lastCareAt, fallback.lastCareAt),
    deadAt: typeof value.deadAt === "number" ? value.deadAt : undefined,
    message: typeof value.message === "string" ? value.message : fallback.message,
  };
}

function decayState(state: PetState, now = Date.now()) {
  if (!state.alive) return { ...state, lastTickAt: now };

  const elapsedHours = Math.max(0, (now - state.lastTickAt) / HOUR);
  const inactiveMs = Math.max(0, now - state.lastCareAt);
  const decayed: PetState = {
    ...state,
    food: clamp(state.food - elapsedHours * 6.8),
    love: clamp(state.love - elapsedHours * 5.2),
    energy: clamp(state.energy - elapsedHours * 4.4),
    longing: clamp(state.longing + elapsedHours * 5.4),
    lastTickAt: now,
  };

  const diedFromStats = decayed.food <= 0 || decayed.love <= 0 || decayed.energy <= 0 || decayed.longing >= 100;
  const diedFromAbsence = inactiveMs >= DEATH_AFTER;

  if (diedFromStats || diedFromAbsence) {
    return {
      ...decayed,
      alive: false,
      deadAt: now,
      food: Math.max(0, decayed.food),
      love: Math.max(0, decayed.love),
      energy: Math.max(0, decayed.energy),
      longing: Math.min(100, Math.max(decayed.longing, 96)),
      deaths: decayed.deaths + 1,
      message: diedFromAbsence
        ? "Benyu murió de extrañitis por abandono. Dramático, sí. Real, también."
        : "Benyu no resistió: se le fueron los signos vitales emocionales.",
    };
  }

  return decayed;
}

function getMood(state: PetState, now: number): Mood {
  if (!state.alive) return "dead";
  if (now >= getReunionTime()) return "reunited";
  if (state.food < 22 || state.love < 22 || state.energy < 18 || state.longing > 82) return "critical";
  if (state.food < 42 || state.love < 42 || state.energy < 35 || state.longing > 62) return "sad";
  if (state.love > 78 && state.food > 55 && state.longing < 45) return "happy";
  return "ok";
}

function formatRemaining(ms: number) {
  if (ms <= 0) return "ya llegó el reencuentro";
  const days = Math.floor(ms / DAY);
  const hours = Math.floor((ms % DAY) / HOUR);
  if (days > 0) return `${days}d ${hours}h`;
  return `${Math.max(1, hours)}h`;
}

function formatAgo(ms: number) {
  if (ms < 60 * 1000) return "recién";
  if (ms < HOUR) return `${Math.floor(ms / (60 * 1000))} min`;
  const hours = Math.floor(ms / HOUR);
  const minutes = Math.floor((ms % HOUR) / (60 * 1000));
  if (hours < 24) return `${hours}h ${minutes}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

function getStatusTitle(mood: Mood) {
  if (mood === "dead") return "Benyu está muerto";
  if (mood === "reunited") return "¡Sobrevivió hasta la vuelta!";
  if (mood === "critical") return "Estado crítico";
  if (mood === "sad") return "Benyu necesita atención";
  if (mood === "happy") return "Benyu está mimado";
  return "Benyu sigue vivo";
}

function getNeedPrompt(state: PetState) {
  if (!state.alive) {
    return {
      title: "Necesidad urgente",
      text: "RCP de amor. No hay debate.",
      actionId: "revive",
      emoji: "💞",
    };
  }

  const needs = [
    { id: "food", value: 100 - state.food, title: "Tiene hambre", text: "Dale comida antes de que se ponga dramático.", emoji: "🍝" },
    { id: "hug", value: 100 - state.love, title: "Necesita mimo", text: "Un abrazo virtual le baja tres cambios.", emoji: "🫂" },
    { id: "sleep", value: 100 - state.energy, title: "Está sin batería", text: "Mandalo a dormir una siestita.", emoji: "😴" },
    { id: "selfie", value: state.longing, title: "Extrañitis subiendo", text: "Una selfie o un “ya falta menos” lo salva.", emoji: "📸" },
  ].sort((a, b) => b.value - a.value);

  const top = needs[0];
  if (top.value < 35) {
    return {
      title: "Está bastante estable",
      text: "Podés elegir cualquier cuidado. Si querés jugar inteligente, mantenelo todo arriba de 60.",
      actionId: "hug",
      emoji: "✅",
    };
  }

  return {
    title: top.title,
    text: top.text,
    actionId: top.id,
    emoji: top.emoji,
  };
}

function StatBar({
  label,
  value,
  dangerHigh = false,
  emoji,
}: {
  label: string;
  value: number;
  dangerHigh?: boolean;
  emoji: string;
}) {
  const danger = dangerHigh ? value > 78 : value < 28;
  const ok = dangerHigh ? value < 55 : value > 55;

  return (
    <div className="rounded-2xl border border-white/70 bg-white/70 p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-black text-[#51373b]">{emoji} {label}</p>
        <p className={`text-xs font-black ${danger ? "text-[#b73343]" : ok ? "text-[#4f7c60]" : "text-[#a66d3f]"}`}>
          {value}%
        </p>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#eadbd7]">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            danger ? "bg-[#d34252]" : ok ? "bg-[#69a978]" : "bg-[#e1a45d]"
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function BenyuPetAvatar({ mood, pulseKey }: { mood: Mood; pulseKey: number }) {
  const isDead = mood === "dead";
  const isCritical = mood === "critical";
  const isSad = mood === "sad";
  const isHappy = mood === "happy" || mood === "reunited";
  const requestedPhoto = isHappy ? HAPPY_PHOTO : SOLO_PHOTO;
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const photoSrc = failedPhoto === requestedPhoto ? FALLBACK_PHOTO : requestedPhoto;
  const isCutout = photoSrc === SOLO_PHOTO;
  const isCouple = photoSrc === HAPPY_PHOTO;

  return (
    <div
      key={pulseKey}
      className={`relative mx-auto aspect-[3/4] w-full max-w-[310px] overflow-hidden rounded-[1.6rem] border-[5px] border-[#503237] bg-[#dfe9e2] shadow-[0_18px_35px_rgba(46,30,34,0.24)] ${
        isDead ? "benyu-photo-dead" : "benyu-pet-bob"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.96),transparent_34%),linear-gradient(180deg,#eef4ef_0%,#cad8cf_100%)]" />
      <div className="absolute inset-x-7 bottom-3 h-8 rounded-full bg-[#503237]/18 blur-md" />
      <div className="absolute left-4 top-12 h-9 w-9 rounded-full bg-white/45 blur-sm" />
      <div className="absolute bottom-14 right-5 h-14 w-14 rounded-full bg-[#d85f65]/12 blur-lg" />

      {/* Native img here is intentional: the source changes by mood and falls back gracefully. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoSrc}
        alt={isCouple ? "Foto real de Benyu con Dani" : "Foto real de Benyu"}
        onError={() => photoSrc !== FALLBACK_PHOTO && setFailedPhoto(requestedPhoto)}
        className={`relative z-10 h-full w-full transition duration-500 ${
          isCutout ? "object-contain object-bottom" : "object-cover"
        } ${
          isDead ? "grayscale opacity-55" : isCritical ? "saturate-[0.7] brightness-90" : isSad ? "saturate-[0.85]" : "saturate-105"
        }`}
        style={{ objectPosition: isCutout ? "50% 100%" : isCouple ? "66% 52%" : "38% 42%" }}
      />

      <div className={`absolute inset-0 ${
        isDead
          ? "bg-[#2f2528]/52"
          : isCritical
            ? "bg-[#d85f65]/22"
            : isHappy
              ? "bg-[#ffd6df]/10"
              : "bg-transparent"
      }`} />

      <div className="absolute left-3 top-3 rounded-full bg-black/58 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white backdrop-blur">
        {isDead ? "offline" : isCritical ? "crítico" : isSad ? "mimos ya" : isHappy ? "mimado" : "live"}
      </div>

      {isDead ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
          <div className="rounded-[1.4rem] bg-black/58 px-6 py-5 shadow-xl backdrop-blur">
            <p className="text-5xl">☠️</p>
            <p className="mt-2 text-3xl font-black tracking-[0.16em]">RIP</p>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-white/80">murió de extrañitis</p>
          </div>
        </div>
      ) : null}

      {!isDead && isHappy ? (
        <div className="pointer-events-none absolute inset-0">
          <span className="benyu-photo-heart left-[12%] top-[18%]">❤️</span>
          <span className="benyu-photo-heart left-[74%] top-[28%]" style={{ animationDelay: "-0.7s" }}>💖</span>
          <span className="benyu-photo-heart left-[54%] top-[8%]" style={{ animationDelay: "-1.1s" }}>✨</span>
        </div>
      ) : null}

      {!isDead && isCritical ? (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-2xl bg-[#d85f65]/90 px-3 py-2 text-center text-xs font-black uppercase tracking-[0.14em] text-white shadow-lg">
          necesita cuidado ya
        </div>
      ) : null}
    </div>
  );
}

export function BenyuTamagotchi({ day }: { day: number }) {
  const storageKey = useMemo(() => `day-${day}-benyu-tamagotchi-${STORAGE_VERSION}`, [day]);
  const introKey = useMemo(() => `day-${day}-benyu-tamagotchi-intro-${STORAGE_VERSION}`, [day]);
  const [state, setState] = useState<PetState>(() => getDefaultState(0));
  const [ready, setReady] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const currentTime = Date.now();
      try {
        const saved = sanitizeState(JSON.parse(localStorage.getItem(storageKey) ?? "null"), currentTime);
        setState(decayState(saved, currentTime));
      } catch {
        setState(getDefaultState(currentTime));
      }
      setNow(currentTime);
      setShowIntro(localStorage.getItem(introKey) !== "seen");
      setReady(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [introKey, storageKey]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [ready, state, storageKey]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
      setState((current) => decayState(current));
    }, 60 * 1000);

    return () => window.clearInterval(interval);
  }, []);

  const effectiveNow = now || state.lastTickAt || 0;
  const mood = getMood(state, effectiveNow);
  const reunionMs = getReunionTime() - effectiveNow;
  const inactiveMs = Math.max(0, effectiveNow - state.lastCareAt);
  const dangerMs = Math.max(0, DEATH_AFTER - inactiveMs);
  const isWarning = state.alive && inactiveMs >= WARNING_AFTER;
  const survivedDays = Math.max(0, Math.floor((effectiveNow - state.createdAt) / DAY));
  const needPrompt = getNeedPrompt(state);
  const comboProgress = state.careCount % 4;
  const comboRemaining = comboProgress === 0 ? 4 : 4 - comboProgress;

  const dismissIntro = () => {
    localStorage.setItem(introKey, "seen");
    setShowIntro(false);
  };

  const care = (action: CareAction) => {
    setState((current) => {
      if (!current.alive || mood === "reunited") return current;
      const actionTime = effectiveNow || current.lastTickAt;
      const decayed = decayState(current, actionTime);
      if (!decayed.alive) return decayed;

      return {
        ...decayed,
        food: clamp(decayed.food + (action.effect.food ?? 0) + ((decayed.careCount + 1) % 4 === 0 ? 6 : 0)),
        love: clamp(decayed.love + (action.effect.love ?? 0) + ((decayed.careCount + 1) % 4 === 0 ? 8 : 0)),
        energy: clamp(decayed.energy + (action.effect.energy ?? 0) + ((decayed.careCount + 1) % 4 === 0 ? 5 : 0)),
        longing: clamp(decayed.longing + (action.effect.longing ?? 0) - ((decayed.careCount + 1) % 4 === 0 ? 8 : 0)),
        lastTickAt: actionTime,
        lastCareAt: actionTime,
        careCount: decayed.careCount + 1,
        message: (decayed.careCount + 1) % 4 === 0
          ? `${action.message} Combo de 4 cuidados: Benyu recuperó estabilidad.`
          : action.message,
      };
    });
    setPulseKey((key) => key + 1);
  };

  const revive = () => {
    const revivedAt = effectiveNow || state.lastTickAt;
    const revived = getDefaultState(revivedAt);
    setState((current) => ({
      ...revived,
      deaths: current.deaths,
      message: "RCP de amor exitoso. Benyu volvió, pero quedó sensible.",
      love: 72,
      longing: 42,
      energy: 56,
      food: 62,
    }));
    setPulseKey((key) => key + 1);
  };

  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-white bg-gradient-to-br from-[#fffdf9] via-[#fff5ef] to-[#f4ddd8] p-4 shadow-[0_18px_55px_rgba(103,54,59,0.1)] sm:p-6">
      <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#ef9b9b]/22 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-[#ffd8b8]/32 blur-3xl" />

      {showIntro && (
        <div className="modal-enter relative z-20 mb-5 rounded-[1.75rem] border border-[#f0c4bd] bg-white/88 p-5 shadow-[0_18px_38px_rgba(103,54,59,0.12)] backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c35b63]">Manual de supervivencia</p>
              <h3 className="font-display mt-1 text-3xl font-semibold leading-none text-[#503237]">Cómo cuidar a Benyu</h3>
              <div className="mt-4 grid gap-2 text-sm font-bold leading-6 text-[#76585c] sm:grid-cols-2">
                <p>🍝 Mantené comida, amor y energía arriba.</p>
                <p>💔 La extrañitis tiene que mantenerse baja.</p>
                <p>⏰ Después de 6h sin cuidado entra en peligro.</p>
                <p>☠️ Después de 10h muere de extrañitis. Sí, posta.</p>
                <p>✨ Cada 4 cuidados seguidos hay combo bonus.</p>
                <p>📸 Mimado aparece con Dani; si no, queda solito con gorro.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissIntro}
              className="rounded-2xl bg-[#d85f65] px-5 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(216,95,101,0.23)] transition hover:bg-[#c64f58] active:scale-[0.98]"
            >
              Entendido, lo cuido
            </button>
          </div>
        </div>
      )}

      <div className="relative grid gap-5 lg:grid-cols-[minmax(0,0.88fr)_minmax(390px,1.12fr)]">
        <div className={`rounded-[2rem] border border-[#dac7bd] bg-[#efe7d9] p-3 shadow-[inset_0_2px_0_rgba(255,255,255,0.75),0_18px_38px_rgba(67,44,49,0.14)] sm:p-5 ${isWarning ? "benyu-critical-pulse" : ""}`}>
          <div className="rounded-[1.55rem] border-4 border-[#503237] bg-[#cbd8ce] p-3 shadow-inner">
            <div className="tamagotchi-screen relative overflow-hidden rounded-[1.25rem] border border-[#829187] bg-[#e8eee9] p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="rounded-full bg-[#503237] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#fce9e5]">
                  Día {day} · BenyuGotchi
                </span>
                <span className="rounded-full bg-white/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#654b50]">
                  {state.alive ? "vivo" : "muerto"} · ☠ {state.deaths}
                </span>
              </div>

              <BenyuPetAvatar mood={mood} pulseKey={pulseKey} />

              <div className="mt-2 rounded-2xl border border-[#bbc7bf] bg-white/72 px-4 py-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a45d64]">{getStatusTitle(mood)}</p>
                <p className="mt-1 text-sm font-black leading-5 text-[#503237]">{state.message}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-[#503237] px-3 py-3 text-center text-white">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#f2bbb5]">Último cuidado</p>
              <p className="mt-1 text-sm font-black">{formatAgo(inactiveMs)}</p>
            </div>
            <div className="rounded-2xl bg-[#fff8f1] px-3 py-3 text-center text-[#503237]">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#a98287]">Para volver</p>
              <p className="mt-1 text-sm font-black">{formatRemaining(reunionMs)}</p>
            </div>
            <div className="rounded-2xl bg-[#fff8f1] px-3 py-3 text-center text-[#503237]">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#a98287]">Cuidados</p>
              <p className="mt-1 text-sm font-black">{state.careCount}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.75rem] border border-white bg-white/70 p-4 shadow-[0_16px_40px_rgba(103,54,59,0.08)] backdrop-blur">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#d85f65] text-white shadow-[0_9px_22px_rgba(216,95,101,0.24)]">
                <HeartIcon className="heartbeat h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c35b63]">Objetivo</p>
                <h3 className="font-display mt-1 text-3xl font-semibold leading-none text-[#503237]">Cuidá a Benyu hasta volver</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#806266]">
                  Si pasan 10 horas sin cuidarlo, muere de extrañitis. Literal modo Tamagotchi.
                </p>
              </div>
            </div>

            {isWarning && state.alive && (
              <div className="mt-4 rounded-2xl border border-[#efb2ad] bg-[#fff0ec] px-4 py-3 text-sm font-black leading-5 text-[#9a3f49]">
                ⚠️ Peligro: si no lo cuidás en {formatRemaining(dangerMs)}, Benyu puede morir.
              </div>
            )}

            <div className="mt-4 rounded-2xl border border-[#f1d0c8] bg-[#fff8f4] px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c35b63]">Necesidad actual</p>
              <p className="mt-1 text-sm font-black text-[#503237]">{needPrompt.emoji} {needPrompt.title}</p>
              <p className="mt-1 text-xs font-bold leading-5 text-[#8a686c]">{needPrompt.text}</p>
            </div>

            {state.alive && mood !== "reunited" ? (
              <div className="mt-3 rounded-2xl border border-[#ecd1c6] bg-white/68 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c35b63]">Combo bonus</p>
                  <p className="text-[11px] font-black text-[#7c595d]">
                    {comboRemaining === 1 ? "falta 1 cuidado" : `faltan ${comboRemaining} cuidados`}
                  </p>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((slot) => (
                    <span
                      key={slot}
                      className={`h-2 rounded-full ${slot < comboProgress ? "bg-[#d85f65]" : "bg-[#eadbd7]"}`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs font-bold leading-5 text-[#8a686c]">
                  Cada cuarto cuidado le da una recuperación extra. Modo novia responsable desbloqueado.
                </p>
              </div>
            ) : null}

            {mood === "reunited" && (
              <div className="mt-4 rounded-2xl border border-[#b9d8bd] bg-[#edf7ee] px-4 py-3 text-sm font-black leading-5 text-[#4f7c60]">
                🎉 Sobrevivió {survivedDays} días. Reclama abrazo real inmediatamente.
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <StatBar label="Comida" value={state.food} emoji="🍝" />
            <StatBar label="Amor" value={state.love} emoji="❤️" />
            <StatBar label="Energía" value={state.energy} emoji="⚡" />
            <StatBar label="Extrañitis" value={state.longing} emoji="💔" dangerHigh />
          </div>

          {state.alive && mood !== "reunited" ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {actions.map((action) => {
                const recommended = action.id === needPrompt.actionId;

                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => care(action)}
                    className={`group rounded-[1.35rem] border px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-white active:scale-[0.98] ${
                      recommended
                        ? "border-[#d85f65] bg-[#fff8f8] shadow-[0_10px_24px_rgba(216,95,101,0.16)]"
                        : "border-[#f1d0c8] bg-white/78 hover:border-[#eaa9a5]"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2 text-sm font-black text-[#503237]">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{action.emoji}</span>
                        {action.label}
                      </span>
                      {recommended ? (
                        <span className="rounded-full bg-[#d85f65] px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-white">
                          ahora
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#a98287]">
                      {action.description}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : mood === "dead" ? (
            <div className="rounded-[1.75rem] border border-[#e2b6b1] bg-[#fff0ec] p-4 text-center">
              <SparkleIcon className="mx-auto h-6 w-6 text-[#b64b55]" />
              <p className="mt-2 text-sm font-black leading-6 text-[#7d464d]">
                Se puede revivir, pero el historial guarda la muerte. Que sirva de lección dramática.
              </p>
              <button
                type="button"
                onClick={revive}
                className="mt-4 w-full rounded-2xl bg-[#d85f65] px-5 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(216,95,101,0.23)] transition hover:bg-[#c64f58] active:scale-[0.99]"
              >
                💞 RCP de amor
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
