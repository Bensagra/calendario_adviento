"use client";

import { useEffect, useMemo, useState } from "react";
import type { RescueGame } from "@/data/days";
import { CheckIcon, HeartIcon, SparkleIcon } from "./icons";

const STORAGE_KEY = "day-8-rescue-missions";

export function RescueMissionGame({ game }: { game: RescueGame }) {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
        if (Array.isArray(saved)) setCompletedIds(saved.filter((id): id is string => typeof id === "string"));
      } catch {
        setCompletedIds([]);
      }
      setReady(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const validCompletedIds = useMemo(
    () => completedIds.filter((id) => game.challenges.some((challenge) => challenge.id === id)),
    [completedIds, game.challenges],
  );
  const total = game.challenges.length;
  const completed = validCompletedIds.length;
  const rescued = ready && completed === total;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  const toggleChallenge = (id: string) => {
    setCompletedIds((current) => {
      const isCompleted = current.includes(id);
      const next = isCompleted ? current.filter((currentId) => currentId !== id) : [...current, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

      if (!isCompleted && next.filter((currentId) => game.challenges.some((challenge) => challenge.id === currentId)).length === total) {
        setJustCompleted(true);
        window.setTimeout(() => setJustCompleted(false), 1800);
      }

      return next;
    });
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white bg-gradient-to-br from-[#fffdf9] via-[#fff5ef] to-[#f9dedb] p-4 shadow-[0_18px_55px_rgba(103,54,59,0.1)] sm:p-7">
      <span className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#ef9b9b]/20 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-16 -left-14 h-44 w-44 rounded-full bg-[#ffd8b8]/30 blur-3xl" />

      <div className="relative">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d85f65] text-white shadow-[0_9px_22px_rgba(216,95,101,0.28)]">
            <HeartIcon className="heartbeat h-6 w-6" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c35b63]">Alerta: extrañitis aguda</p>
            <h3 className="font-display mt-1 text-3xl font-semibold leading-none text-[#503237]">Misión de rescate</h3>
          </div>
        </div>

        <p className="mt-5 text-sm font-semibold leading-6 text-[#76585c]">{game.intro}</p>

        <div className="mt-6 rounded-2xl border border-white/80 bg-white/65 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a16d72]">Rescate en progreso</p>
              <p className="mt-1 text-sm font-bold text-[#503237]">
                {completed} de {total} misiones
              </p>
            </div>
            <span className="font-display text-3xl font-semibold text-[#c75059]">{progress}%</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#f1d8d2]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#e88a82] to-[#c94c57] transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] font-semibold text-[#9a7a7c]">No hay orden: elegí la misión que quieras.</p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {game.challenges.map((challenge, index) => {
            const isCompleted = validCompletedIds.includes(challenge.id);
            return (
              <button
                key={challenge.id}
                type="button"
                aria-pressed={isCompleted}
                onClick={() => toggleChallenge(challenge.id)}
                className={`mission-card group relative min-h-40 overflow-hidden rounded-[1.5rem] border p-4 text-left transition duration-300 active:scale-[0.98] ${
                  isCompleted
                    ? "border-[#afc7a8] bg-[#edf4e9] shadow-[0_8px_24px_rgba(91,116,84,0.12)]"
                    : "border-white bg-white/82 shadow-[0_8px_24px_rgba(103,54,59,0.08)] hover:-translate-y-1 hover:border-[#efc0ba] hover:bg-white"
                }`}
                style={{ transform: isCompleted ? "none" : `rotate(${index % 3 === 0 ? "-0.35" : index % 3 === 1 ? "0.25" : "0"}deg)` }}
              >
                <span className={`absolute -right-5 -top-5 h-20 w-20 rounded-full blur-2xl ${isCompleted ? "bg-[#bdd2b6]/35" : "bg-[#ef9b9b]/20"}`} />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex min-h-10 min-w-10 items-center justify-center rounded-xl bg-[#fff2ec] px-2 text-lg font-black text-[#b84e58] shadow-sm">
                      {challenge.emoji}
                    </span>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition ${isCompleted ? "border-[#76936d] bg-[#76936d] text-white" : "border-[#e9c7c3] bg-white text-transparent group-hover:border-[#d85f65]"}`}>
                      <CheckIcon className="h-4 w-4" />
                    </span>
                  </div>
                  <p className={`mt-4 text-sm font-extrabold ${isCompleted ? "text-[#587051]" : "text-[#503237]"}`}>{challenge.title}</p>
                  <p className={`mt-1 text-xs font-semibold leading-5 ${isCompleted ? "text-[#71806c]" : "text-[#8c7174]"}`}>{challenge.description}</p>
                  <span className={`mt-auto pt-3 text-[9px] font-bold uppercase tracking-[0.16em] ${isCompleted ? "text-[#66805e]" : "text-[#c35b63]"}`}>
                    {isCompleted ? "Misión cumplida" : "Marcar como hecha"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {rescued && (
          <div className={`relative mt-6 overflow-hidden rounded-[1.75rem] border border-[#f0c5c0] bg-gradient-to-br from-[#d85f65] to-[#a83d48] p-6 text-center text-white shadow-[0_16px_38px_rgba(168,61,72,0.25)] ${justCompleted ? "rescue-complete" : ""}`}>
            <SparkleIcon className="sparkle absolute left-5 top-5 h-5 w-5 text-[#ffd9bb]" />
            <SparkleIcon className="sparkle absolute right-6 top-9 h-3 w-3 text-white/80" />
            <HeartIcon className="heartbeat mx-auto h-12 w-12 text-[#ffe1d9]" />
            <h4 className="font-display mt-3 text-4xl font-semibold leading-none">{game.completionTitle}</h4>
            <p className="mx-auto mt-4 max-w-md text-sm font-semibold leading-6 text-white/90">{game.completionMessage}</p>
          </div>
        )}
      </div>
    </section>
  );
}
