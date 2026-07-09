"use client";

import { useEffect } from "react";
import type { CalendarDay } from "@/data/days";
import { CloseIcon } from "./icons";
import { ContentRenderer } from "./ContentRenderer";
import { UnlockGameRenderer } from "./UnlockGameRenderer";

interface DayModalProps {
  item: CalendarDay;
  contentUrl?: string;
  unlockGameCompleted: boolean;
  onUnlockGameComplete: (answer?: string) => void;
  onClose: () => void;
}

export function DayModal({ item, contentUrl, unlockGameCompleted, onUnlockGameComplete, onClose }: DayModalProps) {
  const shouldShowUnlockGame = Boolean(item.unlockGame && item.unlockGame.type !== "none" && !unlockGameCompleted);
  const isVideo = item.type === "video" && !shouldShowUnlockGame;
  const modalWidth = item.type === "postcard" || item.type === "boardingPass" || item.type === "benyuTamagotchi" || item.type === "radar" ? "max-w-6xl" : "max-w-2xl";

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="backdrop-enter fixed inset-0 z-50 flex items-end justify-center bg-[#3b2429]/45 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isVideo ? item.title : undefined}
        aria-labelledby={isVideo ? undefined : "day-title"}
        onMouseDown={(event) => event.stopPropagation()}
        className={isVideo
          ? "modal-enter fixed inset-0 h-screen w-screen overflow-hidden bg-black"
          : `modal-enter max-h-[94vh] w-full ${modalWidth} overflow-y-auto rounded-t-[2rem] bg-[#fffaf6] p-5 shadow-2xl sm:rounded-[2.25rem] sm:p-8`}
      >
        <div className={isVideo ? "pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-end p-4" : "flex items-start justify-between gap-5"}>
          {!isVideo && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#c35b63]">Día {item.day}</p>
              <h2 id="day-title" className="font-display mt-2 text-4xl font-semibold leading-none text-[#503237] sm:text-5xl">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#8c7174]">{item.subtitle}</p>
            </div>
          )}
          <button type="button" onClick={onClose} aria-label="Cerrar sorpresa" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${isVideo ? "pointer-events-auto bg-black/55 text-white hover:bg-black/75" : "bg-[#f4e4df] text-[#805e62] hover:bg-[#edd3cf]"}`}>
            <CloseIcon />
          </button>
        </div>
        <div className={isVideo ? "h-full w-full" : "mt-7"}>
          {shouldShowUnlockGame && item.unlockGame ? (
            <UnlockGameRenderer day={item} unlockGame={item.unlockGame} onComplete={onUnlockGameComplete} />
          ) : (
            <ContentRenderer key={contentUrl || item.file || item.day} item={item} contentUrl={contentUrl} />
          )}
        </div>
      </div>
    </div>
  );
}
