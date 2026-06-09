"use client";

import { useEffect, useState } from "react";
import { days, type CalendarDay } from "@/data/days";
import { TEST_MODE } from "@/data/config";
import type { ContentUrls } from "@/data/contentUrls";
import { CalendarGrid } from "./CalendarGrid";
import { CountdownHeader } from "./CountdownHeader";
import { DayModal } from "./DayModal";
import { HeartIcon } from "./icons";

const STORAGE_KEY = "advent-calendar-viewed-days";

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
  const [contentUrls, setContentUrls] = useState<ContentUrls>({});
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        setViewedDays(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
      } catch {
        setViewedDays([]);
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

  const selectDay = (item: CalendarDay) => {
    if (!isUnlocked(item)) {
      setToast(true);
      window.setTimeout(() => setToast(false), 2400);
      return;
    }

    setSelectedDay(item);
    setViewedDays((current) => {
      if (current.includes(item.day)) return current;
      const next = [...current, item.day];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <main className="page-background relative min-h-screen overflow-hidden px-3 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20">
      <div className="grain pointer-events-none fixed inset-0" />
      <HeartIcon className="float-slow pointer-events-none absolute -left-4 top-72 h-20 w-20 rotate-[-12deg] text-white/30" />
      <HeartIcon className="float-delay pointer-events-none absolute -right-5 top-28 h-24 w-24 rotate-12 text-[#e9a8a5]/20" />

      <div className="relative z-10">
        <CountdownHeader />
        <CalendarGrid items={days} viewedDays={viewedDays} isUnlocked={isUnlocked} onSelect={selectDay} />
        <footer className="mt-14 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-[#aa888a]">
          Hecho con amor para vos
        </footer>
      </div>

      {selectedDay && (
        <DayModal
          item={selectedDay}
          contentUrl={contentUrls[String(selectedDay.day)]}
          onClose={() => setSelectedDay(null)}
        />
      )}

      {toast && (
        <div role="status" className="modal-enter fixed bottom-5 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl bg-[#55373c] px-5 py-4 text-center text-sm font-semibold text-white shadow-xl">
          Todavía no se desbloqueó este día ❤️
        </div>
      )}
    </main>
  );
}
