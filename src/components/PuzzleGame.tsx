"use client";

import { useState } from "react";
import { CheckIcon, HeartIcon } from "./icons";

interface PuzzleGameProps {
  image: string;
  gridSize?: number;
  onSolved: () => void;
}

/** Mezcla las piezas y se asegura de no devolver el rompecabezas ya resuelto. */
function shufflePieces(count: number): number[] {
  const pieces = Array.from({ length: count }, (_, index) => index);
  do {
    for (let i = pieces.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }
  } while (pieces.every((piece, index) => piece === index));
  return pieces;
}

export function PuzzleGame({ image, gridSize = 5, onSolved }: PuzzleGameProps) {
  const totalPieces = gridSize * gridSize;
  // tiles[slot] = id de la pieza que está en ese casillero. Resuelto = tiles[i] === i.
  // Se mezcla desde el primer render (el modal solo se monta al tocar el día, nunca en el
  // server), así la foto completa nunca se ve antes de armarla.
  const [tiles, setTiles] = useState<number[]>(() => shufflePieces(totalPieces));
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [imageError, setImageError] = useState(false);

  const reshuffle = () => {
    setTiles(shufflePieces(totalPieces));
    setSelected(null);
    setMoves(0);
    setSolved(false);
  };

  const tapTile = (slot: number) => {
    if (solved) return;

    if (selected === null) {
      setSelected(slot);
      return;
    }
    if (selected === slot) {
      setSelected(null);
      return;
    }

    setTiles((current) => {
      const next = [...current];
      [next[slot], next[selected]] = [next[selected], next[slot]];
      if (next.every((piece, index) => piece === index)) {
        setSolved(true);
        window.setTimeout(onSolved, 950);
      }
      return next;
    });
    setMoves((count) => count + 1);
    setSelected(null);
  };

  const pieceStyle = (piece: number) => {
    const row = Math.floor(piece / gridSize);
    const col = piece % gridSize;
    const denom = gridSize - 1;
    return {
      backgroundImage: `url(${image})`,
      backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
      backgroundPosition: `${(col / denom) * 100}% ${(row / denom) * 100}%`,
    };
  };

  if (imageError) {
    return (
      <div className="mt-6 flex min-h-44 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-[#d8aeaa] bg-[#fff9f4] p-8 text-center">
        <HeartIcon className="h-7 w-7 text-[#d07a7e]" />
        <p className="mt-4 font-semibold text-[#64484b]">Falta cargar la foto del rompecabezas.</p>
        <p className="mt-1 text-xs text-[#9a7e80]">Guardala como <span className="font-bold">public/content/6.jpg</span> y va a aparecer acá.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Imagen oculta: solo la usamos para detectar si la foto todavía no está cargada. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" aria-hidden onError={() => setImageError(true)} className="hidden" />

      <div className="relative mx-auto aspect-square w-full max-w-sm">
        <div
          className="grid h-full w-full overflow-hidden rounded-[1.25rem]"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gap: solved ? 0 : 2,
          }}
        >
          {tiles.map((piece, slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => tapTile(slot)}
              disabled={solved}
              aria-label={`Pieza ${slot + 1}`}
              className={`relative aspect-square bg-cover transition ${solved ? "rounded-none" : "rounded-[4px]"} ${
                selected === slot
                  ? "z-10 scale-95 ring-4 ring-[#d85f65]"
                  : "ring-1 ring-white/40"
              }`}
              style={pieceStyle(piece)}
            />
          ))}
        </div>

        {/* La foto completa recién se revela cuando se resuelve el rompecabezas. */}
        {solved && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.25rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Foto secreta completa" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
              <span className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-[#c24c57] shadow-lg">
                <CheckIcon className="h-4 w-4" /> ¡Rompecabezas resuelto!
              </span>
            </div>
          </div>
        )}
      </div>

      {!solved && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a7478]">
            Movimientos: {moves}
          </p>
          <button
            type="button"
            onClick={reshuffle}
            className="rounded-full border border-[#efd1cb] bg-white/80 px-4 py-2 text-xs font-bold text-[#68484c] transition hover:border-[#e7aca8] hover:bg-white"
          >
            Mezclar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}
