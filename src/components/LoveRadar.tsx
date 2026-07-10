"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { radarIntro, radarSignals, type RadarSignal } from "@/data/day13Radar";
import { CheckIcon, HeartIcon, SparkleIcon } from "./icons";

const STORAGE_VERSION = "v1";
const DISCOVERY_RADIUS = 7;
const MAX_SIGNAL_DISTANCE = 34;

interface ScanPoint {
  x: number;
  y: number;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function distance(a: ScanPoint, b: Pick<RadarSignal, "x" | "y">) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getSignalStrength(scan: ScanPoint, signals: RadarSignal[]) {
  if (signals.length === 0) return 0;
  const nearest = Math.min(...signals.map((signal) => distance(scan, signal)));
  return clampPercent(100 - (nearest / MAX_SIGNAL_DISTANCE) * 100);
}

function getNearestSignal(scan: ScanPoint, signals: RadarSignal[]) {
  return signals
    .map((signal) => ({ signal, distance: distance(scan, signal) }))
    .sort((a, b) => a.distance - b.distance)[0];
}

function normalizeFoundIds(ids: string[]) {
  const validIds = new Set(radarSignals.map((signal) => signal.id));
  return ids.filter((id) => validIds.has(id));
}

function SignalCard({ signal }: { signal: RadarSignal }) {
  const [imageFailed, setImageFailed] = useState(false);
  const shouldShowImage = Boolean(signal.photo && !imageFailed);

  return (
    <article className="overflow-hidden rounded-[1.6rem] border border-[#f0c4bd] bg-white shadow-[0_18px_38px_rgba(103,54,59,0.1)]">
      {shouldShowImage ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-[#f8ebe5]">
          {/* Native img keeps user-editable public paths forgiving if a file is missing. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={signal.photo}
            alt={signal.title}
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[#fff4ef] to-[#f4ddd8]">
          <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-white/78 text-4xl shadow-sm">
            {signal.emoji}
          </div>
        </div>
      )}

      <div className="p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c35b63]">Señal encontrada</p>
        <h3 className="font-display mt-1 text-3xl font-semibold leading-none text-[#503237]">
          {signal.emoji} {signal.title}
        </h3>
        <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-6 text-[#76585c]">
          {signal.dedication}
        </p>
      </div>
    </article>
  );
}

function FinalLetterCard() {
  return (
    <article className="rounded-[1.9rem] border border-[#e9aaa7] bg-gradient-to-br from-white via-[#fff8f4] to-[#ffe9e1] p-5 shadow-[0_22px_48px_rgba(103,54,59,0.14)] sm:p-7">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d85f65] text-white shadow-[0_9px_22px_rgba(216,95,101,0.24)]">
          <HeartIcon className="heartbeat h-5 w-5" />
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c35b63]">Carta desbloqueada</p>
          <h3 className="font-display mt-1 text-3xl font-semibold leading-none text-[#503237] sm:text-4xl">
            {radarIntro.finalLetterTitle}
          </h3>
        </div>
      </div>
      <p className="whitespace-pre-line text-lg font-semibold leading-8 text-[#68484c] sm:text-xl sm:leading-9">
        {radarIntro.finalLetter}
      </p>
    </article>
  );
}

function SignalPopup({ signal, completed, onClose }: { signal: RadarSignal; completed: boolean; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Señal encontrada: ${signal.title}`}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#3b2429]/58 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="radar-signal-popup w-full max-w-md"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <SignalCard signal={signal} />
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-2xl bg-[#d85f65] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_16px_34px_rgba(216,95,101,0.32)] transition hover:bg-[#c64f58] active:scale-[0.98]"
        >
          {completed ? "Cerrar señal" : "Seguir buscando"}
        </button>
      </div>
    </div>
  );
}

export function LoveRadar({ day }: { day: number }) {
  const radarRef = useRef<HTMLDivElement>(null);
  const storageKey = useMemo(() => `day-${day}-love-radar-${STORAGE_VERSION}`, [day]);
  const [ready, setReady] = useState(false);
  const [scan, setScan] = useState<ScanPoint>({ x: 50, y: 50 });
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [popupSignalId, setPopupSignalId] = useState<string | null>(null);
  const [showFinalLetter, setShowFinalLetter] = useState(false);
  const foundSet = useMemo(() => new Set(foundIds), [foundIds]);
  const hiddenSignals = radarSignals.filter((signal) => !foundSet.has(signal.id));
  const foundSignals = radarSignals.filter((signal) => foundSet.has(signal.id));
  const popupSignal = radarSignals.find((signal) => signal.id === popupSignalId);
  const nearest = hiddenSignals.length > 0 ? getNearestSignal(scan, hiddenSignals) : undefined;
  const strength = getSignalStrength(scan, hiddenSignals);
  const completed = radarSignals.length > 0 && foundIds.length === radarSignals.length;
  const radarHint = completed
    ? "Ya no quedan señales perdidas. Igual podés tocar las encontradas para releerlas."
    : strength >= 58
      ? nearest?.signal.hint ?? "Estás muy cerca de una señal."
      : strength >= 38
        ? "La señal sube, pero todavía falta afinar el radar."
        : "Mové el dedo despacio por el radar para buscar una señal.";

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        setFoundIds(normalizeFoundIds(JSON.parse(localStorage.getItem(storageKey) ?? "[]")));
      } catch {
        setFoundIds([]);
      }
      setReady(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [storageKey]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(storageKey, JSON.stringify(foundIds));
  }, [foundIds, ready, storageKey]);

  const updateScan = (clientX: number, clientY: number) => {
    const rect = radarRef.current?.getBoundingClientRect();
    if (!rect) return;

    const nextScan = {
      x: clampPercent(((clientX - rect.left) / rect.width) * 100),
      y: clampPercent(((clientY - rect.top) / rect.height) * 100),
    };
    setScan(nextScan);

    const nextNearest = getNearestSignal(nextScan, hiddenSignals);
    if (nextNearest && nextNearest.distance <= DISCOVERY_RADIUS) {
      const foundSignalId = nextNearest.signal.id;
      setFoundIds((current) => {
        if (current.includes(foundSignalId)) return current;
        return [...current, foundSignalId];
      });
      setPopupSignalId(foundSignalId);
    }
  };

  const handlePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateScan(event.clientX, event.clientY);
  };

  const resetRadar = () => {
    setFoundIds([]);
    setPopupSignalId(null);
    setShowFinalLetter(false);
    setScan({ x: 50, y: 50 });
  };

  return (
    <section className="relative overflow-hidden rounded-[2.2rem] border border-white bg-gradient-to-br from-[#fffdf9] via-[#fff6f0] to-[#f6dfda] p-4 shadow-[0_18px_55px_rgba(103,54,59,0.1)] sm:p-6">
      <span className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#d85f65]/16 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#ffd0b0]/35 blur-3xl" />

      <div className="relative grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
        <div className="rounded-[2rem] border border-[#e6c7be] bg-[#523137] p-3 text-white shadow-[0_18px_44px_rgba(67,44,49,0.16)] sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f7b9b1]">Día {day} · Modo búsqueda</p>
              <h3 className="font-display mt-1 text-3xl font-semibold leading-none">{radarIntro.title}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#f4d8d1]">{radarIntro.helper}</p>
            </div>
            <div className="rounded-2xl bg-white/12 px-3 py-2 text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#f4c2bc]">Halladas</p>
              <p className="mt-1 text-lg font-black">{foundIds.length}/{radarSignals.length}</p>
            </div>
          </div>

          <div
            ref={radarRef}
            role="application"
            aria-label="Radar interactivo de señales escondidas"
            onPointerDown={handlePointer}
            onPointerMove={(event) => event.buttons === 1 && handlePointer(event)}
            className="love-radar relative mx-auto aspect-square w-full max-w-[440px] touch-none select-none overflow-hidden rounded-full border-[6px] border-[#f6d7d1] bg-[#162a29] shadow-[inset_0_0_35px_rgba(0,0,0,0.34),0_16px_30px_rgba(20,13,15,0.18)]"
          >
            <div className="love-radar-sweep" />
            <div className="love-radar-core" />

            {foundSignals.map((signal, index) => (
              <button
                key={signal.id}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setPopupSignalId(signal.id);
                }}
                className="love-radar-found absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#ffd7de] text-base shadow-[0_0_18px_rgba(255,190,203,0.62)]"
                style={{ left: `${signal.x}%`, top: `${signal.y}%`, animationDelay: `${index * -0.18}s` }}
                aria-label={`Abrir ${signal.title}`}
              >
                {signal.emoji}
              </button>
            ))}

            {nearest && nearest.distance < 11 ? (
              <span
                className="love-radar-ping absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ffd7de]"
                style={{ left: `${nearest.signal.x}%`, top: `${nearest.signal.y}%` }}
              />
            ) : null}

            <div
              className="absolute z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/80 bg-[#d85f65]/80 shadow-[0_0_24px_rgba(216,95,101,0.54)]"
              style={{ left: `${scan.x}%`, top: `${scan.y}%` }}
            >
              <SparkleIcon className="h-5 w-5 text-white" />
            </div>
          </div>

          <div className="mt-4 rounded-[1.4rem] bg-white/10 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f4c2bc]">Intensidad</p>
              <p className="text-sm font-black text-white">{completed ? "100%" : `${strength}%`}</p>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#f7b9b1] to-[#ffffff] transition-[width] duration-200"
                style={{ width: `${completed ? 100 : strength}%` }}
              />
            </div>
            <p className="mt-3 text-xs font-bold leading-5 text-[#f3d6cf]">
              {radarHint}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.75rem] border border-white bg-white/76 p-4 shadow-[0_16px_40px_rgba(103,54,59,0.08)] backdrop-blur">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#d85f65] text-white shadow-[0_9px_22px_rgba(216,95,101,0.24)]">
                <HeartIcon className="heartbeat h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c35b63]">Objetivo</p>
                <h3 className="font-display mt-1 text-3xl font-semibold leading-none text-[#503237]">Encontrá todas las señales</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#806266]">
                  Cada señal puede tener foto, dedicatoria o las dos. Vos las editás en el archivo del día 13.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {radarSignals.map((signal, index) => {
                const found = foundSet.has(signal.id);

                return (
                  <button
                    key={signal.id}
                    type="button"
                    disabled={!found}
                    onClick={() => setPopupSignalId(signal.id)}
                    className={`rounded-2xl border px-2 py-3 text-center transition ${
                      found
                        ? "border-[#e9aaa7] bg-[#fff5f2] text-[#503237] shadow-sm"
                        : "border-[#f0dfda] bg-white/42 text-[#bba0a3]"
                    }`}
                    aria-label={found ? `Ver señal ${index + 1}` : `Señal ${index + 1} todavía no encontrada`}
                  >
                    <span className="block text-xl">{found ? signal.emoji : "?"}</span>
                    <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.12em]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>

            {completed ? (
              <div className="mt-4 rounded-2xl border border-[#efb2ad] bg-[#fff0ec] px-4 py-3 text-sm font-black leading-5 text-[#9a3f49]">
                <p>
                  <CheckIcon className="mr-2 inline h-4 w-4" />
                  {radarIntro.completionTitle}: {radarIntro.completionMessage}
                </p>
                {!showFinalLetter ? (
                  <button
                    type="button"
                    onClick={() => setShowFinalLetter(true)}
                    className="radar-letter-pop mt-4 w-full rounded-2xl bg-[#d85f65] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_16px_34px_rgba(216,95,101,0.32)] transition hover:bg-[#c64f58] active:scale-[0.98]"
                  >
                    Abrir tu cartita pre shabat
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {completed && showFinalLetter ? <FinalLetterCard /> : null}

          <div className="rounded-[1.6rem] border border-dashed border-[#e7b8b2] bg-white/58 p-6 text-center shadow-sm">
            <SparkleIcon className="mx-auto h-7 w-7 text-[#c35b63]" />
            <h3 className="font-display mt-3 text-3xl font-semibold leading-none text-[#503237]">
              {foundIds.length > 0 ? "Las señales aparecen en popup" : "Todavía no abriste una señal"}
            </h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#806266]">
              {foundIds.length > 0
                ? "Cada vez que encuentres una señal, se abre arriba de todo. Cerrala para seguir buscando la próxima."
                : "Pasá el dedo despacio por el radar. Tenés que acercarte bastante para desbloquear una señal."}
            </p>
          </div>

          <button
            type="button"
            onClick={resetRadar}
            className="w-full rounded-2xl border border-[#efc9c1] bg-white/65 px-5 py-3 text-sm font-black text-[#8b555c] transition hover:bg-white active:scale-[0.99]"
          >
            Reiniciar radar para probarlo de nuevo
          </button>
        </div>
      </div>

      {popupSignal ? (
        <SignalPopup
          signal={popupSignal}
          completed={completed}
          onClose={() => setPopupSignalId(null)}
        />
      ) : null}
    </section>
  );
}
