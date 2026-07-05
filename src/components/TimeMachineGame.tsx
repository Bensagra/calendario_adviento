"use client";

import { useEffect, useRef, useState } from "react";
import { HeartIcon, SparkleIcon } from "./icons";

interface TimeMachineGameProps {
  onComplete: () => void;
}

const hearts = [
  { id: 1, size: 44, delay: "-0.4s", duration: "2.1s" },
  { id: 2, size: 50, delay: "-1.8s", duration: "2.5s" },
  { id: 3, size: 42, delay: "-2.5s", duration: "2.2s" },
  { id: 4, size: 48, delay: "-1.1s", duration: "2.6s" },
  { id: 5, size: 46, delay: "-3.2s", duration: "2.3s" },
  { id: 6, size: 46, delay: "-2.1s", duration: "2.4s" },
  { id: 7, size: 42, delay: "-0.8s", duration: "2.15s" },
  { id: 8, size: 50, delay: "-2.8s", duration: "2.55s" },
  { id: 9, size: 42, delay: "-1.5s", duration: "2.25s" },
];

const roamingPoints = [
  { left: 5, top: 8 },
  { left: 40, top: 7 },
  { left: 79, top: 9 },
  { left: 12, top: 39 },
  { left: 46, top: 36 },
  { left: 81, top: 42 },
  { left: 6, top: 72 },
  { left: 40, top: 69 },
  { left: 78, top: 71 },
];

const travelStreaks = Array.from({ length: 18 }, (_, index) => index);

export function TimeMachineGame({ onComplete }: TimeMachineGameProps) {
  const [collected, setCollected] = useState<number[]>([]);
  const [roamingStep, setRoamingStep] = useState(0);
  const [traveling, setTraveling] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const isReady = collected.length === hearts.length;
  const progress = Math.round((collected.length / hearts.length) * 100);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (isReady || traveling) return;
    const interval = window.setInterval(() => setRoamingStep((current) => current + 1), 1600);
    return () => window.clearInterval(interval);
  }, [isReady, traveling]);

  useEffect(() => {
    if (!traveling) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = window.setTimeout(() => onCompleteRef.current(), reduceMotion ? 300 : 1900);
    return () => window.clearTimeout(timeout);
  }, [traveling]);

  const collectHeart = (id: number) => {
    if (traveling) return;
    setCollected((current) => current.includes(id) ? current : [...current, id]);
  };

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a86a70]">Energía romántica</p>
          <p aria-live="polite" className="font-display mt-1 text-3xl font-semibold text-[#503237]">{progress}%</p>
        </div>
        <p className="pb-1 text-right text-xs font-bold text-[#9a7478]">
          {isReady ? "Máquina cargada" : `${collected.length} de ${hearts.length} corazones`}
        </p>
      </div>

      <div
        className="h-2.5 overflow-hidden rounded-full bg-[#efd8d3] shadow-inner"
        role="progressbar"
        aria-label="Energía de la máquina del tiempo"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#e78b86] via-[#d85f65] to-[#b83e4a] transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={`temporal-grid relative mt-4 h-72 overflow-hidden rounded-[1.75rem] border border-[#efc9c4] ${traveling ? "temporal-traveling" : ""}`}>
        <div className="temporal-ring temporal-ring-one" />
        <div className="temporal-ring temporal-ring-two" />

        {!isReady && hearts.map((heart) => {
          if (collected.includes(heart.id)) return null;
          const point = roamingPoints[(heart.id - 1 + roamingStep * 2) % roamingPoints.length];
          return (
            <button
              key={heart.id}
              type="button"
              onClick={() => collectHeart(heart.id)}
              aria-label={`Recoger corazón ${heart.id} de ${hearts.length}`}
              className="time-machine-heart absolute z-10 flex items-center justify-center rounded-full border border-white/80 bg-white/85 text-[#d6535d] shadow-[0_8px_22px_rgba(184,62,74,0.24)] backdrop-blur-sm hover:bg-white active:brightness-90"
              style={{
                left: `${point.left}%`,
                top: `${point.top}%`,
                width: heart.size,
                height: heart.size,
              }}
            >
              <span
                className="time-machine-heart-bob flex items-center justify-center"
                style={{ animationDelay: heart.delay, animationDuration: heart.duration }}
              >
                <HeartIcon className="h-5 w-5" />
              </span>
            </button>
          );
        })}

        {isReady && (
          <div className={`time-destination absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center ${traveling ? "opacity-0" : ""}`}>
            <div className="time-core relative flex h-24 w-24 items-center justify-center rounded-full border border-white/80 bg-white/80 shadow-[0_0_42px_rgba(216,95,101,0.35)] backdrop-blur-sm">
              <HeartIcon className="heartbeat h-10 w-10 text-[#d85f65]" />
              <SparkleIcon className="sparkle absolute -right-1 top-1 h-6 w-6 text-[#e7968f]" />
            </div>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#b34c56]">Destino encontrado</p>
            <p className="font-display mt-2 text-2xl font-semibold leading-tight text-[#503237]">El día en que Danu volvió</p>
          </div>
        )}

        {traveling && (
          <div className="temporal-warp absolute inset-0 z-30 overflow-hidden" aria-live="polite">
            <span className="sr-only">Sincronizando coordenadas. Viajando al futuro. Destino alcanzado.</span>
            <div className="temporal-vignette absolute inset-0" aria-hidden="true" />
            <div className="temporal-rays absolute inset-0" aria-hidden="true">
              {travelStreaks.map((streak) => (
                <span
                  key={streak}
                  className="temporal-ray"
                  style={{ transform: `rotate(${streak * 20}deg)` }}
                >
                  <span className="temporal-ray-beam" style={{ animationDelay: `${-(streak % 6) * 0.09}s` }} />
                </span>
              ))}
            </div>
            <div className="temporal-tunnel absolute left-1/2 top-1/2" aria-hidden="true">
              <div className="temporal-tunnel-heart flex items-center justify-center">
                <HeartIcon className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="temporal-travel-copy absolute inset-x-4 bottom-8 text-center text-white" aria-hidden="true">
              <p className="font-display temporal-message temporal-message-one text-2xl font-semibold">Sincronizando coordenadas…</p>
              <p className="font-display temporal-message temporal-message-two text-2xl font-semibold">Viajando al futuro…</p>
              <p className="font-display temporal-message temporal-message-three text-2xl font-semibold">Destino alcanzado</p>
            </div>
            <div className="temporal-flash absolute inset-0" aria-hidden="true" />
          </div>
        )}
      </div>

      {isReady && (
        <button
          type="button"
          onClick={() => setTraveling(true)}
          disabled={traveling}
          className="time-travel-button mt-4 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#d85f65] px-5 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(216,95,101,0.3)] transition hover:-translate-y-0.5 hover:bg-[#c64f58] disabled:translate-y-0 disabled:cursor-wait disabled:opacity-75"
        >
          <SparkleIcon className="h-4 w-4" />
          {traveling ? "Viajando al futuro…" : "Viajar al futuro"}
        </button>
      )}
    </div>
  );
}
