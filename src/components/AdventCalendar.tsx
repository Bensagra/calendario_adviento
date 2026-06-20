"use client";

import { useEffect, useState } from "react";
import { days, type CalendarDay } from "@/data/days";
import { TEST_MODE } from "@/data/config";
import type { ContentUrls } from "@/data/contentUrls";
import { CalendarGrid } from "./CalendarGrid";
import { CountdownHeader } from "./CountdownHeader";
import { DayModal } from "./DayModal";
import { FloatingHearts } from "./FloatingHearts";
import { HeartIcon } from "./icons";

const STORAGE_KEY = "advent-calendar-viewed-days";
const COMPLETED_GAMES_KEY = "completedUnlockGames";
const GAME_CHOICES_KEY = "unlockGameChoices";

type CompletedUnlockGames = Record<string, boolean>;
type UnlockGameChoices = Record<string, string>;

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AdventCalendar() {
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [viewedDays, setViewedDays] = useState<number[]>([]);
  const [completedUnlockGames, setCompletedUnlockGames] = useState<CompletedUnlockGames>({});
  const [, setUnlockGameChoices] = useState<UnlockGameChoices>({});
  const [contentUrls, setContentUrls] = useState<ContentUrls>({});
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        setViewedDays(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
        setCompletedUnlockGames(JSON.parse(localStorage.getItem(COMPLETED_GAMES_KEY) ?? "{}"));
        setUnlockGameChoices(JSON.parse(localStorage.getItem(GAME_CHOICES_KEY) ?? "{}"));
      } catch {
        setViewedDays([]);
        setCompletedUnlockGames({});
        setUnlockGameChoices({});
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    fetch("/content/urls.json")
      .then((response) => response.ok ? response.json() : {})
      .then((urls: ContentUrls) => setContentUrls(urls))
      .catch(() => setContentUrls({}));
  }, []);

  const isUnlocked = (item: CalendarDay) => TEST_MODE || getLocalDateKey() >= item.unlockDate;
  const hasPendingGame = (item: CalendarDay) => {
    const unlockGame = item.unlockGame;
    return Boolean(unlockGame && unlockGame.type !== "none" && !completedUnlockGames[String(item.day)]);
  };

  const markDayViewed = (day: number) => {
    setViewedDays((current) => {
      if (current.includes(day)) return current;
      const next = [...current, day];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const selectDay = (item: CalendarDay) => {
    if (!isUnlocked(item)) {
      setToast(true);
      window.setTimeout(() => setToast(false), 2400);
      return;
    }

    setSelectedDay(item);
    if (!hasPendingGame(item)) markDayViewed(item.day);
  };

  const completeUnlockGame = (item: CalendarDay, answer?: string) => {
    setCompletedUnlockGames((current) => {
      const next = { ...current, [String(item.day)]: true };
      localStorage.setItem(COMPLETED_GAMES_KEY, JSON.stringify(next));
      return next;
    });

    if (answer) {
      setUnlockGameChoices((current) => {
        const next = { ...current, [String(item.day)]: answer };
        localStorage.setItem(GAME_CHOICES_KEY, JSON.stringify(next));
        return next;
      });
    }

    markDayViewed(item.day);
  };

  return (
    <main className="page-background relative min-h-screen overflow-hidden px-3 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20">
      <div className="grain pointer-events-none fixed inset-0" />
      <FloatingHearts />
      <HeartIcon className="float-slow pointer-events-none absolute -left-4 top-72 h-20 w-20 rotate-[-12deg] text-white/30" />
      <HeartIcon className="float-delay pointer-events-none absolute -right-5 top-28 h-24 w-24 rotate-12 text-[#e9a8a5]/20" />

      <div className="relative z-10">
        <CountdownHeader />
        <CalendarGrid
          items={days}
          viewedDays={viewedDays}
          completedUnlockGames={completedUnlockGames}
          isUnlocked={isUnlocked}
          onSelect={selectDay}
        />
        <footer className="mt-14 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-[#aa888a]">
          Hecho con amor para vos
        </footer>
      </div>

      {selectedDay && (
        <DayModal
          item={selectedDay}
          contentUrl={contentUrls[String(selectedDay.day)]}
          unlockGameCompleted={!hasPendingGame(selectedDay)}
          onUnlockGameComplete={(answer) => completeUnlockGame(selectedDay, answer)}
          onClose={() => setSelectedDay(null)}
        />
      )}

      {toast && (
        <div role="status" className="modal-enter fixed bottom-5 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center justify-center gap-2.5 rounded-2xl bg-[#55373c] px-5 py-4 text-center text-sm font-semibold text-white shadow-xl">
          <HeartIcon className="heartbeat h-4 w-4 text-[#f5b8b3]" />
          Todavía no se desbloqueó este día, ya falta menos ❤️
        </div>
      )}
    </main>
  );
}
