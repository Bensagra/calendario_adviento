"use client";

import { useEffect, useRef } from "react";
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
  const isProtocol = item.type === "hugLaboratory" && !shouldShowUnlockGame;
  const modalWidth = item.type === "postcard" || item.type === "boardingPass" || item.type === "benyuTamagotchi" || item.type === "radar" || item.type === "mystery"
    ? "max-w-6xl"
    : item.type === "reunionVoucher"
      ? "max-w-3xl"
      : "max-w-2xl";
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.cancelAnimationFrame(focusFrame);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  const renderedContent = shouldShowUnlockGame && item.unlockGame ? (
    <UnlockGameRenderer day={item} unlockGame={item.unlockGame} onComplete={onUnlockGameComplete} />
  ) : (
    <ContentRenderer key={contentUrl || item.file || item.day} item={item} contentUrl={contentUrl} />
  );

  return (
    <div className="backdrop-enter fixed inset-0 z-50 flex items-end justify-center bg-[#3b2429]/45 p-0 backdrop-blur-sm sm:items-center sm:p-5" onPointerDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={isVideo ? item.title : undefined}
        aria-labelledby={isVideo ? undefined : "day-title"}
        className={isVideo
          ? "modal-enter fixed inset-0 h-screen w-screen overflow-hidden bg-black"
          : isProtocol
            ? "modal-enter relative h-[100dvh] w-full max-w-3xl overflow-hidden bg-[#100b14] shadow-2xl sm:h-[min(860px,calc(100dvh-2.5rem))] sm:rounded-[2.25rem]"
            : `modal-enter max-h-[94vh] w-full ${modalWidth} overflow-y-auto rounded-t-[2rem] bg-[#fffaf6] p-5 shadow-2xl sm:rounded-[2.25rem] sm:p-8`}
      >
        {isProtocol ? (
          <>
            <h2 id="day-title" className="sr-only">{item.title}</h2>
            <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Cerrar sorpresa" className="absolute right-3 top-[max(.75rem,env(safe-area-inset-top))] z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#160f19]/75 text-[#dcc8cf] shadow-lg backdrop-blur transition hover:bg-[#2d1d29] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8c98] sm:right-5 sm:top-5">
              <CloseIcon />
            </button>
            <div className="h-full min-h-0">{renderedContent}</div>
          </>
        ) : (
          <>
            <div className={isVideo ? "pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-end p-4" : "flex items-start justify-between gap-5"}>
              {!isVideo && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#c35b63]">Día {item.day}</p>
                  <h2 id="day-title" className="font-display mt-2 text-4xl font-semibold leading-none text-[#503237] sm:text-5xl">{item.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-[#8c7174]">{item.subtitle}</p>
                </div>
              )}
              <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Cerrar sorpresa" className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${isVideo ? "pointer-events-auto bg-black/55 text-white hover:bg-black/75" : "bg-[#f4e4df] text-[#805e62] hover:bg-[#edd3cf]"}`}>
                <CloseIcon />
              </button>
            </div>
            <div className={isVideo ? "h-full w-full" : "mt-7"}>
              {renderedContent}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
