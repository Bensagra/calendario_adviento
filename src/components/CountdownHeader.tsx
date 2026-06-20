"use client";

import { useEffect, useState } from "react";
import { CALENDAR_START_DATE, REUNION_DATE } from "@/data/config";
import { HeartIcon, SparkleIcon } from "./icons";

function getLocalMidnight(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`);
}

function diffInDays(from: Date, to: Date) {
  return Math.max(0, Math.ceil((to.getTime() - from.getTime()) / 86_400_000));
}

function formatStartDate() {
  return getLocalMidnight(CALENDAR_START_DATE).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
  });
}

export function CountdownHeader() {
  // Se calcula en el navegador para que el contador esté siempre al día
  // (la página se genera estática y si no, quedaría congelado en la fecha del deploy).
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      setToday(now);
    };
    update();
    const id = window.setInterval(update, 60 * 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  const start = getLocalMidnight(CALENDAR_START_DATE);
  const reunion = getLocalMidnight(REUNION_DATE);
  const countingDay = today && today > start ? today : start;
  const daysLeft = diffInDays(countingDay, reunion);
  const daysUntilStart = today ? diffInDays(today, start) : 0;
  const reunited = Boolean(today) && daysLeft === 0;

  return (
    <header className="fade-up mx-auto max-w-3xl text-center">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/55 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#a94a53] shadow-sm backdrop-blur-xl">
        <HeartIcon className="heartbeat h-3.5 w-3.5" />
        Una sorpresa por día
      </div>
      <h1 className="font-display text-[3.4rem] font-semibold leading-[0.9] tracking-[-0.045em] text-[#4d2d32] sm:text-7xl">
        20 días para
        <span className="gradient-text block italic">volver a verte</span>
      </h1>
      <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-[#81686b] sm:text-base">
        Un calendario hecho con amor, un día a la vez.
      </p>

      {daysUntilStart > 0 && (
        <div className="pop-in mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-[#e9b9b4]/70 bg-white/45 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#b65159] shadow-sm backdrop-blur-xl">
          <SparkleIcon className="sparkle h-3.5 w-3.5" />
          La aventura empieza el {formatStartDate()}
          <span className="rounded-full bg-[#d85f65] px-2 py-0.5 text-white">
            {daysUntilStart} {daysUntilStart === 1 ? "día" : "días"}
          </span>
        </div>
      )}

      <div className="glass-card mx-auto mt-7 flex max-w-sm items-center justify-center gap-4 rounded-2xl px-6 py-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#d85f65] text-white shadow-[0_5px_15px_rgba(216,95,101,0.32)]">
          <HeartIcon className="heartbeat h-5 w-5" />
        </span>
        {reunited ? (
          <span className="text-base font-semibold text-[#68464b]">Hoy nos volvemos a ver ❤️</span>
        ) : (
          <span className="flex items-baseline gap-2 text-left">
            <span className="pop-in font-display text-5xl font-semibold leading-none text-[#bf4c56]">
              {daysLeft}
            </span>
            <span className="text-sm font-semibold leading-5 text-[#68464b]">
              {daysLeft === 1 ? "día para" : "días para"}
              <br />
              volver a vernos
            </span>
          </span>
        )}
      </div>
    </header>
  );
}
