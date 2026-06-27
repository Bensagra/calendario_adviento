import type { CalendarDay } from "@/data/days";
import { CheckIcon, HeartIcon, LockIcon, SparkleIcon } from "./icons";

interface DayCardProps {
  item: CalendarDay;
  index: number;
  unlocked: boolean;
  viewed: boolean;
  completedGame: boolean;
  onClick: () => void;
}

export function DayCard({ item, index, unlocked, viewed, completedGame, onClick }: DayCardProps) {
  const hasGame = item.unlockGame && item.unlockGame.type !== "none";
  const attention = unlocked && !viewed;

  return (
    <div className="card-in h-full" style={{ animationDelay: `${index * 65}ms` }}>
      <button
        type="button"
        onClick={onClick}
        aria-label={`Día ${item.day}: ${item.title}. ${unlocked ? "Desbloqueado" : "Bloqueado"}`}
        className={`day-card group relative h-full w-full min-h-44 overflow-hidden rounded-[1.75rem] border p-4 text-left transition duration-300 active:scale-[0.97] sm:min-h-48 sm:p-5 ${
          unlocked
            ? "day-card-unlocked border-white/90 bg-white/72 hover:-translate-y-1.5 hover:bg-white/85"
            : "border-white/55 bg-white/32 opacity-80 hover:-translate-y-0.5 hover:opacity-100 hover:bg-white/45"
        } ${item.isSpecialDate ? "day-card-special" : ""} ${attention ? "attention" : ""}`}
      >
        {/* La entrada vive en el contenedor para que las animaciones de estado no la reemplacen. */}
        {/* Brillo que cruza al pasar el mouse */}
        <span className="pointer-events-none absolute inset-y-0 -left-1/4 z-20 w-1/4 -translate-x-[160%] -skew-x-12 bg-gradient-to-r from-transparent via-white/55 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[520%]" />

        {/* Brillo lento permanente en los días bloqueados */}
        {!unlocked && <span className="shimmer-overlay pointer-events-none absolute inset-0 z-10" />}

        <span className={`absolute -right-8 -top-10 h-24 w-24 rounded-full blur-2xl transition ${unlocked ? "bg-[#ef9b9b]/40 group-hover:bg-[#ef9b9b]/60" : "bg-white/30"}`} />
        <div className="relative z-[1] flex h-full flex-col">
          <div className="flex items-start justify-between">
            <span className={`font-display text-5xl font-semibold leading-none ${unlocked ? "text-[#c75059]" : "text-[#9c8788]"}`}>
              {String(item.day).padStart(2, "0")}
            </span>
            <div className="flex flex-col items-end gap-2">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full transition ${unlocked ? "bg-[#f9dad6] text-[#c24c57] group-hover:bg-[#f6c9c3]" : "bg-white/55 text-[#9a8587]"}`}>
                {unlocked ? <HeartIcon className="heartbeat h-4 w-4" /> : <LockIcon className="bob h-4 w-4" />}
              </span>
              {item.isSpecialDate && (
                <span className="flex items-center gap-1 rounded-full bg-[#d85f65] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
                  <SparkleIcon className="sparkle h-2.5 w-2.5" />
                  {item.specialLabel ?? "Día especial"}
                </span>
              )}
            </div>
          </div>
          <div className="mt-auto pt-5">
            <p className="line-clamp-2 text-sm font-bold leading-5 text-[#52383c]">{item.title}</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] ${attention ? "text-[#c24c57]" : "text-[#947a7d]"}`}>
                {unlocked ? (
                  <>
                    {attention && <HeartIcon className="heartbeat h-2.5 w-2.5" />}
                    Abrir sorpresa
                  </>
                ) : (
                  <>
                    <SparkleIcon className="sparkle h-2.5 w-2.5" />
                    Todavía falta
                  </>
                )}
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
    </div>
  );
}
