import type { CalendarDay } from "@/data/days";
import { CheckIcon, HeartIcon, LockIcon } from "./icons";

interface DayCardProps {
  item: CalendarDay;
  unlocked: boolean;
  viewed: boolean;
  completedGame: boolean;
  onClick: () => void;
}

export function DayCard({ item, unlocked, viewed, completedGame, onClick }: DayCardProps) {
  const hasGame = item.unlockGame && item.unlockGame.type !== "none";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Día ${item.day}: ${item.title}. ${unlocked ? "Desbloqueado" : "Bloqueado"}`}
      className={`day-card group relative min-h-44 overflow-hidden rounded-[1.75rem] border p-4 text-left transition duration-300 active:scale-[0.97] sm:min-h-48 sm:p-5 ${
        unlocked
          ? "day-card-unlocked border-white/90 bg-white/72 hover:-translate-y-1 hover:bg-white/85"
          : "border-white/55 bg-white/32 opacity-65 hover:bg-white/45"
      } ${item.isSpecialDate ? "day-card-special" : ""}`}
    >
      <span className={`absolute -right-8 -top-10 h-24 w-24 rounded-full blur-2xl transition ${unlocked ? "bg-[#ef9b9b]/40 group-hover:bg-[#ef9b9b]/60" : "bg-white/30"}`} />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between">
          <span className={`font-display text-5xl font-semibold leading-none ${unlocked ? "text-[#c75059]" : "text-[#9c8788]"}`}>
            {String(item.day).padStart(2, "0")}
          </span>
          <div className="flex flex-col items-end gap-2">
            <span className={`flex h-9 w-9 items-center justify-center rounded-full ${unlocked ? "bg-[#f9dad6] text-[#c24c57]" : "bg-white/55 text-[#9a8587]"}`}>
              {unlocked ? <HeartIcon className="h-4 w-4" /> : <LockIcon className="h-4 w-4" />}
            </span>
            {item.isSpecialDate && (
              <span className="rounded-full bg-[#d85f65] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
                {item.specialLabel ?? "Día especial"}
              </span>
            )}
          </div>
        </div>
        <div className="mt-auto pt-5">
          <p className="line-clamp-2 text-sm font-bold leading-5 text-[#52383c]">{item.title}</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#947a7d]">
              {unlocked ? "Abrir sorpresa" : "Todavía falta"}
            </span>
            {hasGame && completedGame && (
              <span className="flex items-center gap-1 rounded-full bg-[#fff0e6] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#a85a4c]">
                <CheckIcon className="h-3 w-3" /> desbloqueado
              </span>
            )}
            {viewed && (
              <span className="flex items-center gap-1 rounded-full bg-[#e9f0e6] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#60735c]">
                <CheckIcon className="h-3 w-3" /> visto
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
