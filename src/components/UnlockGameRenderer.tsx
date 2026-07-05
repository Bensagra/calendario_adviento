"use client";

import { useState } from "react";
import type { CalendarDay, UnlockGame } from "@/data/days";
import { CheckIcon, HeartIcon } from "./icons";
import { PuzzleGame } from "./PuzzleGame";
import { TimeMachineGame } from "./TimeMachineGame";

interface UnlockGameRendererProps {
  day: CalendarDay;
  unlockGame: UnlockGame;
  onComplete: (answer?: string) => void;
}

function normalizeAnswer(answer: string) {
  return answer.trim().toLocaleLowerCase("es-AR");
}

export function UnlockGameRenderer({ day, unlockGame, onComplete }: UnlockGameRendererProps) {
  const [textValue, setTextValue] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [scratchProgress, setScratchProgress] = useState(0);
  const [isScratching, setIsScratching] = useState(false);

  const finish = (answer?: string) => {
    if (success) return;
    setError("");
    setSuccess(unlockGame.successMessage ?? "Listo. Sorpresa desbloqueada ❤️");
    window.setTimeout(() => onComplete(answer), 650);
  };

  const chooseQuizOption = (option: string) => {
    if (normalizeAnswer(option) === normalizeAnswer(unlockGame.correctAnswer ?? "")) {
      finish(option);
      return;
    }

    setError("Casi, probá otra vez ❤️");
  };

  const submitPassword = () => {
    const acceptedAnswers = unlockGame.acceptedAnswers ?? [];
    const normalizedValue = normalizeAnswer(textValue);
    const isAccepted = acceptedAnswers.some((answer) => normalizeAnswer(answer) === normalizedValue);

    if (isAccepted) {
      finish(textValue);
      return;
    }

    setError("Mmm, no era esa. Probá otra ❤️");
  };

  const submitFreeText = () => {
    if (textValue.trim()) {
      finish(textValue);
      return;
    }

    setError("Escribí algo cortito para desbloquearlo ❤️");
  };

  const addScratchProgress = (amount: number) => {
    setScratchProgress((current) => {
      const next = Math.min(100, current + amount);
      if (next >= 100 && current < 100) {
        window.setTimeout(() => finish(), 120);
      }
      return next;
    });
  };

  const renderOptions = (onChoose: (option: string) => void) => (
    <div className="mt-6 grid gap-2">
      {(unlockGame.options ?? []).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChoose(option)}
          disabled={Boolean(success)}
          className="rounded-2xl border border-[#f2d6d0] bg-white/80 px-4 py-3 text-left text-sm font-semibold text-[#68484c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#e7aca8] hover:bg-white disabled:cursor-default disabled:opacity-70"
        >
          {option}
        </button>
      ))}
    </div>
  );

  return (
    <section className="rounded-[2rem] border border-white bg-gradient-to-br from-white/95 to-[#fff1ea] p-5 shadow-[0_16px_45px_rgba(103,54,59,0.08)] sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f9dad6] text-[#c24c57]">
          <HeartIcon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c35b63]">Desbloqueo del día {day.day}</p>
          <h3 className="font-display mt-1 text-3xl font-semibold leading-none text-[#503237]">Antes de abrir</h3>
        </div>
      </div>

      {unlockGame.question && (
        <p className="mt-6 text-lg font-semibold leading-7 text-[#5a3b3f]">{unlockGame.question}</p>
      )}

      {unlockGame.helperText && (
        <p className="mt-2 text-xs font-semibold leading-5 text-[#9a7a7c]">{unlockGame.helperText}</p>
      )}

      {unlockGame.type === "quiz" && renderOptions(chooseQuizOption)}

      {unlockGame.type === "choice" && renderOptions((option) => finish(option))}

      {unlockGame.type === "puzzle" && unlockGame.image && (
        <PuzzleGame image={unlockGame.image} gridSize={unlockGame.gridSize} onSolved={() => finish()} />
      )}

      {unlockGame.type === "timeMachine" && (
        <TimeMachineGame onComplete={() => finish()} />
      )}

      {unlockGame.type === "mission" && (
        <button
          type="button"
          onClick={() => finish()}
          disabled={Boolean(success)}
          className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#d85f65] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(216,95,101,0.25)] transition hover:-translate-y-0.5 hover:bg-[#c64f58] disabled:opacity-75"
        >
          {unlockGame.buttonText ?? "Ya lo hice"}
        </button>
      )}

      {unlockGame.type === "password" && (
        <form
          className="mt-6 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            submitPassword();
          }}
        >
          <input
            value={textValue}
            onChange={(event) => setTextValue(event.target.value)}
            placeholder={unlockGame.placeholder}
            disabled={Boolean(success)}
            className="w-full rounded-2xl border border-[#efd1cb] bg-white/80 px-4 py-3 text-sm font-semibold text-[#503237] outline-none transition placeholder:text-[#b89b9b] focus:border-[#d85f65] focus:bg-white"
          />
          <button
            type="submit"
            disabled={Boolean(success)}
            className="w-full rounded-2xl bg-[#d85f65] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(216,95,101,0.25)] transition hover:-translate-y-0.5 hover:bg-[#c64f58] disabled:opacity-75"
          >
            {unlockGame.buttonText ?? "Desbloquear"}
          </button>
        </form>
      )}

      {unlockGame.type === "freeText" && (
        <form
          className="mt-6 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            submitFreeText();
          }}
        >
          <textarea
            value={textValue}
            onChange={(event) => setTextValue(event.target.value)}
            placeholder={unlockGame.placeholder}
            disabled={Boolean(success)}
            rows={4}
            className="w-full resize-none rounded-2xl border border-[#efd1cb] bg-white/80 px-4 py-3 text-sm font-semibold leading-6 text-[#503237] outline-none transition placeholder:text-[#b89b9b] focus:border-[#d85f65] focus:bg-white"
          />
          <button
            type="submit"
            disabled={Boolean(success)}
            className="w-full rounded-2xl bg-[#d85f65] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(216,95,101,0.25)] transition hover:-translate-y-0.5 hover:bg-[#c64f58] disabled:opacity-75"
          >
            {unlockGame.buttonText ?? "Guardar y abrir"}
          </button>
        </form>
      )}

      {unlockGame.type === "scratch" && (
        <div className="mt-6">
          <div
            role="button"
            tabIndex={0}
            aria-label="Raspar tarjeta"
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              setIsScratching(true);
              addScratchProgress(20);
            }}
            onPointerMove={() => isScratching && addScratchProgress(12)}
            onPointerUp={() => setIsScratching(false)}
            onPointerCancel={() => setIsScratching(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") addScratchProgress(35);
            }}
            className="relative flex min-h-44 touch-none select-none items-center justify-center overflow-hidden rounded-[1.75rem] border border-[#efc8c2] bg-[#fffaf6] p-6 text-center shadow-inner outline-none"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.9),transparent_24%),linear-gradient(135deg,#d85f65,#f1b0a7,#fff1e8)] transition-opacity duration-300" style={{ opacity: Math.max(0.08, 1 - scratchProgress / 100) }} />
            <div className="relative z-10">
              <p className="font-display text-3xl font-semibold text-[#503237]">
                {scratchProgress >= 100 ? "Cupón listo" : "Raspá acá"}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9a7478]">
                {scratchProgress >= 100 ? "Desbloqueando..." : "Tocá o arrastrá"}
              </p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#f1d8d2]">
            <div className="h-full rounded-full bg-[#d85f65] transition-all" style={{ width: `${scratchProgress}%` }} />
          </div>
        </div>
      )}

      {(error || success) && (
        <div
          role="status"
          className={`mt-5 flex items-start gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${
            success ? "bg-[#e9f0e6] text-[#60735c]" : "bg-[#fff3ee] text-[#a94a53]"
          }`}
        >
          {success && <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{success || error}</span>
        </div>
      )}
    </section>
  );
}
