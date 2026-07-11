"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { day14Mystery, type MysteryStep } from "@/data/day14Mystery";
import { CheckIcon, SparkleIcon } from "./icons";

const STORAGE_VERSION = "v10";

type Feedback = {
  kind: "success" | "error";
  text: string;
};

type StoredMysteryProgress = {
  started: boolean;
  solvedIds: string[];
};

const emptyProgress: StoredMysteryProgress = {
  started: false,
  solvedIds: [],
};

const monitorStates = [
  {
    label: "Desaparecido",
    detail: "Última señal: 22:14. La nota rota del escritorio es la primera evidencia.",
    percent: 10,
  },
  {
    label: "Nota reconstruida",
    detail: "El reverso reveló un itinerario de regreso. El laboratorio ya analiza las marcas.",
    percent: 26,
  },
  {
    label: "Itinerario resuelto",
    detail: "El último mensaje señaló a un testigo silencioso. Hay cuatro objetos bajo sospecha.",
    percent: 42,
  },
  {
    label: "Testigo hallado",
    detail: "Detrás del reloj apareció una foto. La fecha escondida abre el próximo candado.",
    percent: 58,
  },
  {
    label: "Caja abierta",
    detail: "La fecha del aniversario era la llave. Adentro hay un grabador.",
    percent: 74,
  },
  {
    label: "Identidad verificada",
    detail: "El grabador te reconoció. Queda un solo escondite por abrir.",
    percent: 90,
  },
];

const rescueConfetti = [
  { left: "6%", delay: "0s", emoji: "❤️", size: "1.1rem" },
  { left: "16%", delay: "1.4s", emoji: "✨", size: "0.9rem" },
  { left: "27%", delay: "0.6s", emoji: "💛", size: "1rem" },
  { left: "38%", delay: "2.1s", emoji: "💖", size: "1.2rem" },
  { left: "49%", delay: "0.2s", emoji: "⭐", size: "0.85rem" },
  { left: "60%", delay: "1.8s", emoji: "🎈", size: "1.05rem" },
  { left: "70%", delay: "0.9s", emoji: "❤️", size: "0.9rem" },
  { left: "80%", delay: "2.5s", emoji: "✨", size: "1.15rem" },
  { left: "89%", delay: "0.4s", emoji: "💖", size: "1rem" },
  { left: "95%", delay: "1.2s", emoji: "💛", size: "0.85rem" },
];

function normalizeAnswer(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeSolvedIds(value: unknown) {
  const rawIds = Array.isArray(value)
    ? value.filter((id): id is string => typeof id === "string")
    : [];
  const solvedIds: string[] = [];

  for (const step of day14Mystery.steps) {
    if (!rawIds.includes(step.id)) break;
    solvedIds.push(step.id);
  }

  return solvedIds;
}

function parseStoredProgress(raw: string | null): StoredMysteryProgress {
  if (!raw) return emptyProgress;

  try {
    const parsed: unknown = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return {
        started: parsed.length > 0,
        solvedIds: normalizeSolvedIds(parsed),
      };
    }

    if (parsed && typeof parsed === "object") {
      const progress = parsed as Record<string, unknown>;
      return {
        started: progress.started === true,
        solvedIds: normalizeSolvedIds(progress.solvedIds),
      };
    }
  } catch {
    return emptyProgress;
  }

  return emptyProgress;
}

function FeedbackBanner({ feedback }: { feedback: Feedback | null }) {
  if (!feedback) return null;

  return (
    <div
      role="status"
      className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-black leading-5 ${
        feedback.kind === "success"
          ? "border-[#b7d0af] bg-[#eff7ec] text-[#57704f]"
          : "border-[#efb4ad] bg-[#fff0ed] text-[#a6454f]"
      }`}
    >
      {feedback.kind === "success" ? (
        <CheckIcon className="mr-2 inline h-4 w-4" />
      ) : (
        <span className="mr-2 inline-block">🔎</span>
      )}
      {feedback.text}
    </div>
  );
}

function CaseTimeline({ currentIndex, completed }: { currentIndex: number; completed: boolean }) {
  return (
    <div className="space-y-2">
      {day14Mystery.steps.map((step, index) => {
        const solved = completed || index < currentIndex;
        const active = !completed && index === currentIndex;

        return (
          <div
            key={step.id}
            className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition ${
              solved
                ? "border-[#b8d0b0] bg-[#eff7ec] text-[#55704d]"
                : active
                  ? "mystery-clue-active border-[#eab0aa] bg-[#fff4f0] text-[#8f3f49]"
                  : "border-white/12 bg-white/8 text-white/62"
            }`}
          >
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
              solved ? "bg-[#6f9066] text-white" : active ? "bg-[#d85f65] text-white" : "bg-white/12 text-white/65"
            }`}>
              {solved ? <CheckIcon className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-black uppercase tracking-[0.16em]">{step.eyebrow}</p>
              <p className="truncate text-xs font-black">{step.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BenyuPoster({ found = false }: { found?: boolean }) {
  return (
    <div
      className={`mystery-poster relative w-44 shrink-0 rounded-xl bg-[#fdf3e7] p-3 text-center shadow-[0_18px_36px_rgba(20,10,14,0.35)] ${
        found ? "rotate-2" : "-rotate-3"
      }`}
    >
      <span className="mystery-poster-tape" aria-hidden />
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8a4a45]">
        {found ? "aparecido" : "¿lo viste?"}
      </p>
      <div className="mt-2 overflow-hidden rounded-lg border border-[#e8d3bd]">
        <svg viewBox="0 0 96 96" aria-hidden className="block h-auto w-full">
          <rect width="96" height="96" fill="#ffe8df" />
          <circle cx="26" cy="16" r="12" fill="#fff" opacity="0.45" />
          <circle cx="48" cy="54" r="27" fill="#f5c9a9" />
          <path d="M19 54c0-21 12-32 29-32s29 11 29 32c-6-13-16-17-29-17s-23 4-29 17Z" fill="#3b241c" />
          <circle cx="38" cy="56" r="3" fill="#2c3138" />
          <circle cx="58" cy="56" r="3" fill="#2c3138" />
          <circle cx="30" cy="63" r="4" fill="#f09aa2" opacity="0.65" />
          <circle cx="66" cy="63" r="4" fill="#f09aa2" opacity="0.65" />
          {found ? (
            <path d="M41 66c4 4 10 4 14 0" fill="none" stroke="#74323a" strokeLinecap="round" strokeWidth="2.5" />
          ) : (
            <path d="M42 69q6-5 12 0" fill="none" stroke="#74323a" strokeLinecap="round" strokeWidth="2.5" />
          )}
          {found ? (
            <path d="M78 24s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 86 13c0 6-8 11-8 11Z" fill="#d85f65" />
          ) : (
            <text x="76" y="26" fontSize="14" textAnchor="middle">❓</text>
          )}
        </svg>
      </div>
      <p className="font-display mt-2 text-xl font-semibold leading-none text-[#503237]">Benyu</p>
      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.18em] text-[#a3766f]">
        {found ? "entregarse a la detective" : "recompensa: 1 abrazo largo"}
      </p>
      {found ? <span className="mystery-stamp">encontrado</span> : null}
    </div>
  );
}

function IntroPanel({ onStart }: { onStart: () => void }) {
  return (
    <section className="mystery-board relative overflow-hidden rounded-[2.2rem] border border-white bg-[#2f2027] p-5 text-white shadow-[0_18px_55px_rgba(103,54,59,0.14)] sm:p-8">
      <span className="mystery-scanline" />
      <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#d85f65]/28 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[#f4b49a]/20 blur-3xl" />

      <div className="relative">
        <div className="flex flex-col-reverse items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f5b7af]">{day14Mystery.caseNumber}</p>
              <span className="mystery-case-stamp rounded-xl border-2 border-[#ffc9c1] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#ffc9c1]">
                urgente
              </span>
            </div>
            <h3 className="font-display mt-2 text-4xl font-semibold leading-none sm:text-5xl">
              {day14Mystery.title}
            </h3>
            <p className="mt-3 text-sm font-bold leading-6 text-[#f1d2cb]">{day14Mystery.subtitle}</p>
          </div>
          <BenyuPoster />
        </div>

        <div className="mt-6 rounded-[1.8rem] border border-white/14 bg-white/9 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#f5b7af]">{day14Mystery.introTitle}</p>
          <p className="mt-3 text-base font-semibold leading-7 text-white/88">{day14Mystery.intro}</p>
        </div>

        <div className="mystery-signal-card mt-5 rounded-[1.8rem] border border-[#ffb8b0]/20 bg-[#120d12]/46 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#ffb8b0]">Señal perdida</p>
              <p className="mt-1 text-xl font-black text-white">BNY-14 · fuera de radar</p>
            </div>
            <div className="mystery-radar-mini relative h-16 w-16 shrink-0 rounded-full border border-[#ffb8b0]/35 bg-[#27171f]">
              <span />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {["6 pistas", "1 candado", "1 final"].map((label) => (
              <div key={label} className="rounded-2xl bg-white/8 px-3 py-2 text-center text-[10px] font-black uppercase tracking-[0.12em] text-[#f6d0ca]">
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Detective a cargo", "Danu"],
            ["Desaparecido", "Benyu"],
            ["Recompensa", "1 abrazo largo"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#f3bfb8]">{label}</p>
              <p className="mt-1 text-sm font-black text-white">{value}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onStart}
          className="mystery-primary-button mt-6 w-full rounded-2xl bg-[#d85f65] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_18px_34px_rgba(216,95,101,0.34)] transition hover:bg-[#c94f59] active:scale-[0.99] sm:w-auto"
        >
          {day14Mystery.startButton}
        </button>
      </div>
    </section>
  );
}

function FinalRescue({
  showCoupon,
  onShowCoupon,
}: {
  showCoupon: boolean;
  onShowCoupon: () => void;
}) {
  return (
    <section className="mystery-rescue-card relative overflow-hidden rounded-[2rem] border border-[#f1beb8] bg-gradient-to-br from-[#fffaf6] via-[#fff0eb] to-[#f8d8d2] p-5 text-center shadow-[0_18px_42px_rgba(103,54,59,0.1)] sm:p-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ position: "absolute" }}>
        {rescueConfetti.map((piece, index) => (
          <span
            key={index}
            className="mystery-confetti"
            style={{ left: piece.left, animationDelay: piece.delay, fontSize: piece.size }}
          >
            {piece.emoji}
          </span>
        ))}
      </div>
      <span className="pointer-events-none absolute left-5 top-6 text-2xl">🕵️‍♀️</span>
      <span className="pointer-events-none absolute right-6 top-7 text-2xl">💘</span>
      <div className="relative mx-auto w-fit">
        <BenyuPoster found />
      </div>
      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-[#c35b63]">Caso cerrado</p>
      <h3 className="font-display mt-2 text-5xl font-semibold leading-none text-[#503237]">
        {day14Mystery.final.title}
      </h3>
      <p className="mx-auto mt-4 max-w-xl text-base font-semibold leading-7 text-[#76585c]">
        {day14Mystery.final.message}
      </p>

      <button
        type="button"
        onClick={onShowCoupon}
        className="mystery-primary-button mt-6 rounded-2xl bg-[#d85f65] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_18px_34px_rgba(216,95,101,0.28)] transition hover:bg-[#c94f59] active:scale-[0.99]"
      >
        {day14Mystery.final.button}
      </button>

      {showCoupon ? (
        <div className="mystery-coupon mx-auto mt-6 max-w-lg rounded-[1.8rem] border-2 border-dashed border-[#c95a62] bg-white/86 p-5 text-left shadow-[0_16px_34px_rgba(103,54,59,0.1)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c35b63]">{day14Mystery.final.couponTitle}</p>
          <p className="font-display mt-3 text-3xl font-semibold leading-tight text-[#503237]">
            Abrazo pendiente liberado
          </p>
          <p className="mt-3 text-sm font-bold leading-6 text-[#76585c]">{day14Mystery.final.coupon}</p>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#a78083]">{day14Mystery.final.signature}</p>
        </div>
      ) : null}
    </section>
  );
}

export function BenyuMystery({ day }: { day: number }) {
  const storageKey = useMemo(() => `day-${day}-benyu-mystery-${STORAGE_VERSION}`, [day]);
  const stepPanelRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [codeValue, setCodeValue] = useState("");
  const [password, setPassword] = useState("");
  const [selectedDoorId, setSelectedDoorId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [justSolvedId, setJustSolvedId] = useState<string | null>(null);
  const [showCoupon, setShowCoupon] = useState(false);

  const currentIndex = Math.min(solvedIds.length, day14Mystery.steps.length);
  const completed = currentIndex === day14Mystery.steps.length;
  const currentStep = completed ? undefined : day14Mystery.steps[currentIndex];
  const progressPercent = Math.round((currentIndex / day14Mystery.steps.length) * 100);
  const monitor = completed
    ? {
        label: "Rescatado",
        detail: "Caso cerrado. Se recomienda abrazo presencial apenas sea posible.",
        percent: 100,
      }
    : monitorStates[currentIndex] ?? monitorStates[0];

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const saved = parseStoredProgress(localStorage.getItem(storageKey));
      setStarted(saved.started);
      setSolvedIds(saved.solvedIds);
      setReady(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [storageKey]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(storageKey, JSON.stringify({ started, solvedIds }));
  }, [ready, solvedIds, started, storageKey]);

  const clearAttemptState = () => {
    setSelectedWords([]);
    setSelectedSymbols([]);
    setSelectedEvidenceId(null);
    setCodeValue("");
    setPassword("");
    setSelectedDoorId(null);
  };

  const solveStep = (step: MysteryStep) => {
    setSolvedIds((current) => {
      if (current.includes(step.id)) return current;
      return [...current, step.id];
    });
    setFeedback({ kind: "success", text: step.successMessage });
    setJustSolvedId(day14Mystery.steps[currentIndex + 1]?.id ?? "completed");
    setShowCoupon(false);
    clearAttemptState();
    window.setTimeout(() => setJustSolvedId(null), 1300);

    if (window.matchMedia("(max-width: 1023px)").matches) {
      window.requestAnimationFrame(() => {
        stepPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const showMistake = (step: MysteryStep, text = step.mistakeMessage) => {
    setFeedback({ kind: "error", text });
  };

  const checkCurrentStep = () => {
    if (!currentStep) return;

    if (currentStep.type === "wordOrder") {
      const isComplete = selectedWords.length === currentStep.solution.length;
      const isCorrect = isComplete && currentStep.solution.every((word, index) => selectedWords[index] === word);
      if (isCorrect) {
        solveStep(currentStep);
      } else {
        showMistake(
          currentStep,
          isComplete ? currentStep.mistakeMessage : "Te falta completar la frase antes de confirmar.",
        );
      }
      return;
    }

    if (currentStep.type === "symbolSequence") {
      const isComplete = selectedSymbols.length === currentStep.solution.length;
      const isCorrect = isComplete && currentStep.solution.every((symbolId, index) => selectedSymbols[index] === symbolId);
      if (isCorrect) {
        solveStep(currentStep);
      } else {
        showMistake(
          currentStep,
          isComplete ? currentStep.mistakeMessage : "Te falta activar todos los sellos antes de confirmar.",
        );
      }
      return;
    }

    if (currentStep.type === "evidenceChoice") {
      if (!selectedEvidenceId) {
        showMistake(currentStep, "Primero elegí una evidencia de la mesa.");
        return;
      }
      if (selectedEvidenceId === currentStep.correctOptionId) {
        solveStep(currentStep);
      } else {
        showMistake(currentStep);
      }
      return;
    }

    if (currentStep.type === "codeLock") {
      if (codeValue === currentStep.solution) {
        solveStep(currentStep);
      } else {
        showMistake(
          currentStep,
          codeValue.length < currentStep.solution.length ? "Te faltan números para completar el código." : currentStep.mistakeMessage,
        );
      }
      return;
    }

    if (currentStep.type === "password") {
      const attempt = normalizeAnswer(password);
      const isCorrect = currentStep.acceptedAnswers.some((answer) => normalizeAnswer(answer) === attempt);
      if (isCorrect) {
        solveStep(currentStep);
      } else {
        showMistake(currentStep);
      }
      return;
    }

    if (!selectedDoorId) {
      showMistake(currentStep, "Elegí una puerta antes de intentar abrirla.");
      return;
    }

    if (selectedDoorId === currentStep.correctDoorId) {
      solveStep(currentStep);
    } else {
      showMistake(currentStep);
    }
  };

  const resetCase = () => {
    localStorage.removeItem(storageKey);
    setStarted(false);
    setSolvedIds([]);
    setFeedback(null);
    setJustSolvedId(null);
    setShowCoupon(false);
    clearAttemptState();
  };

  const renderStepControls = (step: MysteryStep) => {
    if (step.type === "wordOrder") {
      const usedWordCounts = selectedWords.reduce<Record<string, number>>((counts, word) => {
        counts[word] = (counts[word] ?? 0) + 1;
        return counts;
      }, {});
      const seenWordCounts: Record<string, number> = {};
      const availableWords = step.wordBank
        .map((word, index) => {
          seenWordCounts[word] = (seenWordCounts[word] ?? 0) + 1;
          return { word, index, occurrence: seenWordCounts[word] };
        })
        .filter(({ word, occurrence }) => occurrence > (usedWordCounts[word] ?? 0));

      return (
        <div className="mt-5">
          <div className="min-h-20 rounded-[1.5rem] border border-dashed border-[#e4b9b3] bg-[#fff9f4] p-3">
            <p className="mb-2 text-right text-[9px] font-black uppercase tracking-[0.16em] text-[#b18a8d]">
              {selectedWords.length} de {step.solution.length} palabras
            </p>
            {selectedWords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedWords.map((word, index) => (
                  <button
                    key={`${word}-${index}`}
                    type="button"
                    onClick={() => {
                      setFeedback(null);
                      setSelectedWords((current) => current.filter((_, currentIndex) => currentIndex !== index));
                    }}
                    className="rounded-2xl bg-[#513238] px-3 py-2 text-sm font-black text-white shadow-sm transition active:scale-[0.97]"
                  >
                    {word}
                    <span className="ml-2 text-white/58">×</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="flex min-h-14 items-center justify-center text-center text-sm font-bold text-[#a48688]">
                La frase secreta aparece acá…
              </p>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {availableWords.map(({ word, index }) => (
              <button
                key={`${word}-${index}`}
                type="button"
                onClick={() => {
                  if (selectedWords.length >= step.solution.length) {
                    setFeedback({ kind: "error", text: "La frase ya tiene todas sus palabras. Sacá alguna si querés cambiarla." });
                    return;
                  }
                  setFeedback(null);
                  setSelectedWords((current) => [...current, word]);
                }}
                className="mystery-word-chip rounded-2xl border border-[#f0cdc6] bg-white px-3 py-3 text-sm font-black text-[#65454a] transition hover:border-[#d85f65] hover:text-[#9a3f49] active:scale-[0.97]"
              >
                {word}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <button
              type="button"
              onClick={checkCurrentStep}
              className="rounded-2xl bg-[#d85f65] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_28px_rgba(216,95,101,0.24)] transition hover:bg-[#c94f59] active:scale-[0.99]"
            >
              Confirmar frase
            </button>
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setSelectedWords([]);
              }}
              className="rounded-2xl border border-[#efc9c1] bg-white/75 px-5 py-3 text-sm font-black text-[#8b555c] transition hover:bg-white"
            >
              Reordenar
            </button>
          </div>
        </div>
      );
    }

    if (step.type === "symbolSequence") {
      const selectedItems = selectedSymbols
        .map((symbolId) => step.symbols.find((symbol) => symbol.id === symbolId))
        .filter((symbol): symbol is (typeof step.symbols)[number] => Boolean(symbol));
      const availableSymbols = step.symbols.filter((symbol) => !selectedSymbols.includes(symbol.id));

      return (
        <div className="mt-5">
          <div className="mystery-sequence-track rounded-[1.5rem] border border-[#efc9c1] bg-[#fff9f4] p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c35b63]">Ruta activada</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {Array.from({ length: step.solution.length }).map((_, index) => {
                const item = selectedItems[index];

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setFeedback(null);
                      setSelectedSymbols((current) => current.filter((__, currentIndex) => currentIndex !== index));
                    }}
                    className={`mystery-sequence-slot min-h-20 rounded-2xl border text-center transition active:scale-[0.97] ${
                      item
                        ? "border-[#d85f65] bg-[#513238] text-white"
                        : "border-dashed border-[#e3b9b3] bg-white/65 text-[#b89498]"
                    }`}
                  >
                    <span className="block pt-3 text-2xl">{item?.emoji ?? "?"}</span>
                    <span className="mt-1 block text-[9px] font-black uppercase tracking-[0.1em]">{item?.label ?? `Sello ${index + 1}`}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {availableSymbols.map((symbol) => (
              <button
                key={symbol.id}
                type="button"
                onClick={() => {
                  if (selectedSymbols.length >= step.solution.length) return;
                  setFeedback(null);
                  setSelectedSymbols((current) => [...current, symbol.id]);
                }}
                className="mystery-symbol-card relative overflow-hidden rounded-[1.5rem] border border-white bg-white/82 p-4 text-left shadow-[0_10px_24px_rgba(103,54,59,0.07)] transition hover:border-[#efb7b0] active:scale-[0.98]"
              >
                <span className="text-3xl">{symbol.emoji}</span>
                <span className="mt-3 block text-sm font-black text-[#503237]">{symbol.label}</span>
                <span className="mt-1 block text-xs font-semibold leading-5 text-[#826468]">{symbol.clue}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <button
              type="button"
              onClick={checkCurrentStep}
              className="rounded-2xl bg-[#d85f65] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_28px_rgba(216,95,101,0.24)] transition hover:bg-[#c94f59] active:scale-[0.99]"
            >
              Activar ruta
            </button>
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setSelectedSymbols([]);
              }}
              className="rounded-2xl border border-[#efc9c1] bg-white/75 px-5 py-3 text-sm font-black text-[#8b555c] transition hover:bg-white"
            >
              Borrar sellos
            </button>
          </div>
        </div>
      );
    }

    if (step.type === "evidenceChoice") {
      return (
        <div className="mt-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {step.options.map((option) => {
              const selected = selectedEvidenceId === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setFeedback(null);
                    setSelectedEvidenceId(option.id);
                  }}
                  className={`mystery-evidence-card relative overflow-hidden rounded-[1.5rem] border p-4 text-left transition active:scale-[0.98] ${
                    selected
                      ? "border-[#d85f65] bg-[#fff1ed] shadow-[0_12px_28px_rgba(216,95,101,0.16)]"
                      : "border-white bg-white/78 shadow-[0_10px_24px_rgba(103,54,59,0.07)] hover:border-[#efb7b0]"
                  }`}
                >
                  <div className="relative flex items-start gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff2ec] text-2xl shadow-sm">
                      {option.emoji}
                    </span>
                    <span>
                      <span className="block text-sm font-black text-[#503237]">{option.title}</span>
                      <span className="mt-1 block text-xs font-semibold leading-5 text-[#826468]">{option.description}</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={checkCurrentStep}
            className="mt-4 w-full rounded-2xl bg-[#d85f65] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_28px_rgba(216,95,101,0.24)] transition hover:bg-[#c94f59] active:scale-[0.99]"
          >
            Analizar evidencia
          </button>
        </div>
      );
    }

    if (step.type === "codeLock") {
      const keypadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "OK"];

      return (
        <div className="mt-5">
          {step.image ? (
            <div className="mb-4 overflow-hidden rounded-[1.7rem] border-4 border-white bg-white p-2 shadow-[0_14px_30px_rgba(64,38,45,0.16)]">
              {/* Native img keeps this evidence lightweight and lets the player zoom it on mobile. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={step.image}
                alt="Fotografía de evidencia con una fecha escondida"
                className="max-h-[62vh] w-full rounded-[1.25rem] object-contain"
              />
              <p className="px-2 pb-1 pt-3 text-center text-[10px] font-black uppercase tracking-[0.18em] text-[#8b555c]">
                Evidencia fotográfica · Tocá para mirar de cerca
              </p>
            </div>
          ) : null}
          <div className="mystery-lock-console rounded-[1.7rem] border border-[#4a3037] bg-[#20171d] p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_16px_32px_rgba(64,38,45,0.18)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#f6b8b0]">{step.displayLabel}</p>
              <span className="mystery-alarm-dot h-3 w-3 rounded-full bg-[#ff4d5b]" />
            </div>
            <div className="mystery-code-display mt-3 rounded-2xl border border-[#f6b8b0]/18 bg-black/45 px-4 py-5 text-center font-mono text-4xl font-black tracking-[0.24em] text-[#ffd7d2]">
              {codeValue.padEnd(step.solution.length, "·")}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {keypadKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setFeedback(null);
                    if (key === "OK") {
                      checkCurrentStep();
                      return;
                    }
                    if (key === "⌫") {
                      setCodeValue((current) => current.slice(0, -1));
                      return;
                    }
                    setCodeValue((current) => current.length >= step.solution.length ? current : `${current}${key}`);
                  }}
                  className={`rounded-2xl px-4 py-4 text-lg font-black shadow-sm transition active:scale-[0.97] ${
                    key === "OK"
                      ? "bg-[#d85f65] text-white"
                      : key === "⌫"
                        ? "bg-white/12 text-[#ffd7d2]"
                        : "bg-white text-[#513238]"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (step.type === "password") {
      return (
        <form
          className="mt-5"
          onSubmit={(event) => {
            event.preventDefault();
            checkCurrentStep();
          }}
        >
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#c35b63]" htmlFor="benyu-mystery-password">
            Contraseña del archivo
          </label>
          <input
            id="benyu-mystery-password"
            value={password}
            onChange={(event) => {
              setFeedback(null);
              setPassword(event.target.value);
            }}
            placeholder={step.placeholder}
            autoComplete="off"
            className="mt-2 w-full rounded-2xl border border-[#efc9c1] bg-white px-4 py-4 text-base font-black text-[#503237] outline-none transition placeholder:text-[#c0a4a7] focus:border-[#d85f65] focus:ring-4 focus:ring-[#d85f65]/12"
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-2xl bg-[#d85f65] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_28px_rgba(216,95,101,0.24)] transition hover:bg-[#c94f59] active:scale-[0.99]"
          >
            Probar código
          </button>
        </form>
      );
    }

    return (
      <div className="mt-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {step.doors.map((door, index) => {
            const selected = selectedDoorId === door.id;

            return (
              <button
                key={door.id}
                type="button"
                onClick={() => {
                  setFeedback(null);
                  setSelectedDoorId(door.id);
                }}
                className={`relative min-h-52 overflow-hidden rounded-[1.5rem] border p-4 text-left transition active:scale-[0.98] ${
                  selected
                    ? "border-[#d85f65] bg-[#fff1ed] shadow-[0_12px_28px_rgba(216,95,101,0.16)]"
                    : "border-white bg-white/78 shadow-[0_10px_24px_rgba(103,54,59,0.07)] hover:border-[#efb7b0]"
                }`}
              >
                <span className="absolute right-3 top-3 rounded-full bg-[#513238] px-2 py-1 text-[10px] font-black text-white/82">
                  Puerta {index + 1}
                </span>
                <span className="mt-6 block text-5xl">{door.emoji}</span>
                <span className="mt-5 block text-base font-black leading-5 text-[#503237]">{door.label}</span>
                <span className="mt-2 block text-xs font-semibold leading-5 text-[#826468]">{door.description}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={checkCurrentStep}
          className="mt-4 w-full rounded-2xl bg-[#d85f65] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_28px_rgba(216,95,101,0.24)] transition hover:bg-[#c94f59] active:scale-[0.99]"
        >
          Abrir puerta
        </button>
      </div>
    );
  };

  if (!ready) {
    return (
      <section className="rounded-[2rem] border border-white bg-[#fff9f4] p-8 text-center shadow-[0_18px_55px_rgba(103,54,59,0.1)]">
        <SparkleIcon className="sparkle mx-auto h-8 w-8 text-[#c35b63]" />
        <p className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-[#8b555c]">Cargando expediente…</p>
      </section>
    );
  }

  if (!started) {
    return (
      <IntroPanel
        onStart={() => {
          setStarted(true);
          setFeedback({ kind: "success", text: "Expediente abierto. La detective ya puede empezar la búsqueda." });
        }}
      />
    );
  }

  return (
    <section className="mystery-board relative overflow-hidden rounded-[2.2rem] border border-white bg-[#2f2027] p-4 shadow-[0_18px_55px_rgba(103,54,59,0.14)] sm:p-6">
      <span className="mystery-scanline" />
      <span className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#d85f65]/24 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#ffd0b0]/18 blur-3xl" />

      <div className="relative mb-4 rounded-[1.7rem] border border-white/12 bg-[#140f15]/52 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#f5b7af]">Investigación activa</p>
            <p className="mt-1 text-sm font-black">
              {completed ? "Caso cerrado" : `Nivel ${currentIndex + 1} de ${day14Mystery.steps.length}`}
            </p>
          </div>
          <span className="mystery-alarm-pill rounded-full bg-[#d85f65] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em]">
            {monitor.label}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/12">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#f6b8b0] to-white transition-[width] duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-3 flex gap-1.5">
          {day14Mystery.steps.map((step, index) => (
            <span
              key={step.id}
              className={`h-2 flex-1 rounded-full ${
                index < currentIndex ? "bg-[#f6b8b0]" : index === currentIndex && !completed ? "mystery-mobile-dot bg-white" : "bg-white/18"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative grid grid-cols-1 gap-5 lg:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.28fr)]">
        <aside className="order-2 rounded-[2rem] border border-white/12 bg-white/8 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur sm:p-5 lg:order-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f5b7af]">
                Día {day} · {day14Mystery.caseNumber}
              </p>
              <h3 className="font-display mt-2 text-4xl font-semibold leading-none">{day14Mystery.title}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#f1d2cb]">{day14Mystery.subtitle}</p>
            </div>
            <span className="rounded-2xl bg-[#d85f65] px-3 py-2 text-lg shadow-[0_10px_22px_rgba(216,95,101,0.22)]">
              🕵️‍♀️
            </span>
          </div>

          <div className="mt-5 rounded-[1.45rem] border border-white/12 bg-[#1d151b]/42 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#f5b7af]">
                  {day14Mystery.monitorLabel}
                </p>
                <p className="mt-1 text-lg font-black text-white">{monitor.label}</p>
              </div>
              <span className="text-2xl">{completed ? "💘" : "🚨"}</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/28">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#f5b7af] to-white transition-[width] duration-500"
                style={{ width: `${monitor.percent}%` }}
              />
            </div>
            <p className="mt-3 text-xs font-bold leading-5 text-[#f2d7d1]">{monitor.detail}</p>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#f5b7af]">Pistas del caso</p>
            <CaseTimeline currentIndex={currentIndex} completed={completed} />
          </div>

          <button
            type="button"
            onClick={resetCase}
            className="mt-5 w-full rounded-2xl border border-white/14 bg-white/8 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white/78 transition hover:bg-white/14"
          >
            Reiniciar caso
          </button>
        </aside>

        <div ref={stepPanelRef} className="order-1 scroll-mt-4 lg:order-2">
          {completed ? (
            <FinalRescue showCoupon={showCoupon} onShowCoupon={() => setShowCoupon(true)} />
          ) : currentStep ? (
            <article key={currentStep.id} className={`mystery-case-card relative overflow-hidden rounded-[2rem] border border-white bg-gradient-to-br from-[#fffdf9] via-[#fff6f1] to-[#f7ded8] p-5 shadow-[0_18px_42px_rgba(103,54,59,0.1)] sm:p-7 ${justSolvedId === currentStep.id ? "mystery-success-pulse" : ""}`}>
              <span className="mystery-fingerprint pointer-events-none absolute -right-5 top-14 text-8xl text-[#d85f65]/8">⌾</span>
              <span className="mystery-confidential" aria-hidden>confidencial</span>
              <span className="mystery-tape left-5 top-4 rotate-[-4deg]">evidencia {currentIndex + 1} de {day14Mystery.steps.length}</span>
              <div className="pt-7">
                <div className="mb-4 flex items-center justify-between gap-3 rounded-[1.4rem] border border-[#efd0ca] bg-white/58 px-4 py-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#c35b63]">Pista actual</p>
                    <p className="mt-1 text-xs font-black text-[#76585c]">Caso Benyu desaparecido</p>
                  </div>
                  <div className="rounded-2xl bg-[#513238] px-3 py-2 text-center text-white">
                    <p className="text-[8px] font-black uppercase tracking-[0.12em] text-white/62">Nivel</p>
                    <p className="text-sm font-black">{currentIndex + 1}/{day14Mystery.steps.length}</p>
                  </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c35b63]">{currentStep.eyebrow}</p>
                <h3 className="font-display mt-2 text-4xl font-semibold leading-none text-[#503237] sm:text-5xl">
                  {currentStep.title}
                </h3>
                <p className="mt-4 text-sm font-semibold leading-6 text-[#76585c]">{currentStep.briefing}</p>
                <div className="mt-4 rounded-2xl border border-[#efd0ca] bg-white/68 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c35b63]">Objetivo</p>
                  <p className="mt-1 text-sm font-bold leading-6 text-[#76585c]">{currentStep.instruction}</p>
                </div>
                {renderStepControls(currentStep)}
                <FeedbackBanner feedback={feedback} />
                <details className="mt-4 rounded-2xl border border-[#efd0ca] bg-white/52 px-4 py-3 text-sm font-bold text-[#7a5b5f]">
                  <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.16em] text-[#c35b63]">
                    Pedir pista
                  </summary>
                  <p className="mt-2 leading-6">{currentStep.hint}</p>
                </details>
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}
