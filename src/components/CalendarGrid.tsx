import type { CalendarDay } from "@/data/days";
import { DayCard } from "./DayCard";

interface CalendarGridProps {
  items: CalendarDay[];
  viewedDays: number[];
  completedUnlockGames: Record<string, boolean>;
  isUnlocked: (day: CalendarDay) => boolean;
  onSelect: (day: CalendarDay) => void;
}

export function CalendarGrid({ items, viewedDays, completedUnlockGames, isUnlocked, onSelect }: CalendarGridProps) {
  return (
    <section aria-label="Calendario de sorpresas" className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {items.map((item, index) => (
        <DayCard
          key={item.day}
          item={item}
          index={index}
          unlocked={isUnlocked(item)}
          viewed={viewedDays.includes(item.day)}
          completedGame={Boolean(completedUnlockGames[String(item.day)])}
          onClick={() => onSelect(item)}
        />
      ))}
    </section>
  );
}
