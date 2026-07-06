"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { PostcardConfig } from "@/data/days";
import { CheckIcon, HeartIcon, SparkleIcon } from "./icons";

interface PostcardCreatorProps {
  config?: PostcardConfig;
  day: number;
}

interface PostcardPreset {
  id: string;
  label: string;
  eyebrow: string;
  description: string;
  colors: [string, string, string];
  accent: string;
  ink: string;
  image: string;
  credit: string;
  sourceUrl: string;
}

interface PostcardDraft {
  presetId: string;
  place: string;
  mood: string;
  message: string;
  signature: string;
  stickers: string[];
}

interface GeneratedPostcard {
  file: File;
  url: string;
}

const presets: PostcardPreset[] = [
  {
    id: "jerusalem",
    label: "Jerusalem dorada",
    eyebrow: "piedra, sol y magia",
    description: "Una postal cálida, como luz de tarde sobre la ciudad.",
    colors: ["#f5bd66", "#8f6fae", "#24476e"],
    accent: "#c85260",
    ink: "#432c31",
    image: "/content/postcard-backgrounds/jerusalem.jpg",
    credit: "Ilanit Ohana / Unsplash",
    sourceUrl: "https://unsplash.com/photos/6nSAHTGfzEY",
  },
  {
    id: "desert",
    label: "Desierto suave",
    eyebrow: "arena, calma y aventura",
    description: "Para un día de ruta, paisaje abierto o momento tranquilo.",
    colors: ["#be7347", "#f0c987", "#4c827b"],
    accent: "#aa5548",
    ink: "#4a3027",
    image: "/content/postcard-backgrounds/desert.jpg",
    credit: "Avi Theret / Unsplash",
    sourceUrl: "https://unsplash.com/photos/HhhUZxsO_Ak",
  },
  {
    id: "telaviv",
    label: "Mar de Tel Aviv",
    eyebrow: "agua, aire y sol",
    description: "Más fresca, perfecta para foto linda o día con energía.",
    colors: ["#2685b5", "#f3bd61", "#fff1d7"],
    accent: "#147d94",
    ink: "#213843",
    image: "/content/postcard-backgrounds/telaviv.jpg",
    credit: "Marat Badykov / Unsplash",
    sourceUrl: "https://unsplash.com/photos/GIx7TN7s9Kg",
  },
  {
    id: "shabbat",
    label: "Noche de Shabat",
    eyebrow: "velitas lejos",
    description: "Oscura, íntima y especial para un mensaje más tierno.",
    colors: ["#182b58", "#845278", "#ffd19b"],
    accent: "#d98c7a",
    ink: "#fdf1e6",
    image: "/content/postcard-backgrounds/shabbat.jpg",
    credit: "Kanishk Agarwal / Unsplash",
    sourceUrl: "https://unsplash.com/photos/Rfa4f100Jeo",
  },
  {
    id: "camino",
    label: "Camino nuevo",
    eyebrow: "pasitos de viaje",
    description: "Para contar algo que pasó, una anécdota o un mini logro.",
    colors: ["#c95261", "#eca067", "#5e9888"],
    accent: "#ad4050",
    ink: "#3f3032",
    image: "/content/postcard-backgrounds/camino.jpg",
    credit: "Robert Bye / Unsplash",
    sourceUrl: "https://unsplash.com/photos/6PLB5SKWiIY",
  },
];

const moods = [
  "Feliz",
  "Cansada pero feliz",
  "Modo aventurera",
  "Te extraño",
  "Shabat shalom",
  "Insoportable de linda",
];

const stickerOptions = [
  "Te extraño",
  "Pensé en vos",
  "Benyu vení",
  "Modo viaje",
  "Guárdame un abrazo",
  "Desde Israel",
  "Para cuando vuelva",
  "Hoy fue hermoso",
];

const defaultConfig: PostcardConfig = {
  prompt: "Dejame un pedacito de tu día en formato postal.",
  defaultPlace: "Israel",
  defaultMessage: "Hoy pensé en vos cuando...",
  defaultSignature: "Danu",
  shareText: "Benyu, te mando mi postal viva desde Israel ❤️",
};

function getDefaultDraft(config: PostcardConfig): PostcardDraft {
  return {
    presetId: presets[0].id,
    place: config.defaultPlace,
    mood: moods[0],
    message: config.defaultMessage,
    signature: config.defaultSignature,
    stickers: ["Te extraño", "Pensé en vos", "Desde Israel"],
  };
}

function isDraft(value: unknown): value is Partial<PostcardDraft> {
  return Boolean(value && typeof value === "object");
}

function sanitizeDraft(value: unknown, fallback: PostcardDraft): PostcardDraft {
  if (!isDraft(value)) return fallback;

  const presetId = typeof value.presetId === "string" && presets.some((preset) => preset.id === value.presetId)
    ? value.presetId
    : fallback.presetId;
  const mood = typeof value.mood === "string" && moods.includes(value.mood) ? value.mood : fallback.mood;
  const stickers = Array.isArray(value.stickers)
    ? value.stickers.filter((sticker): sticker is string => stickerOptions.includes(String(sticker))).slice(0, 3)
    : fallback.stickers;

  return {
    presetId,
    mood,
    stickers: stickers.length ? stickers : fallback.stickers,
    place: typeof value.place === "string" ? value.place.slice(0, 42) : fallback.place,
    message: typeof value.message === "string" ? value.message.slice(0, 170) : fallback.message,
    signature: typeof value.signature === "string" ? value.signature.slice(0, 28) : fallback.signature,
  };
}

function roundedPath(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string | CanvasGradient | CanvasPattern,
) {
  ctx.save();
  ctx.beginPath();
  roundedPath(ctx, x, y, width, height, radius);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.restore();
}

function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  strokeStyle: string,
  lineWidth: number,
) {
  ctx.save();
  ctx.beginPath();
  roundedPath(ctx, x, y, width, height, radius);
  ctx.closePath();
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.restore();
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawCoverImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function drawContainImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + height - drawHeight;

  ctx.save();
  ctx.shadowColor = "rgba(34, 21, 26, 0.34)";
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 18;
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
      continue;
    }

    if (current) lines.push(current);
    current = word;

    if (lines.length === maxLines) break;
  }

  if (current && lines.length < maxLines) lines.push(current);

  if (words.length && lines.length === maxLines) {
    const fullText = words.join(" ");
    const visibleText = lines.join(" ");
    if (visibleText.length < fullText.length) {
      let lastLine = lines[lines.length - 1];
      while (ctx.measureText(`${lastLine}...`).width > maxWidth && lastLine.length > 0) {
        lastLine = lastLine.slice(0, -1).trim();
      }
      lines[lines.length - 1] = `${lastLine}...`;
    }
  }

  return lines.length ? lines : [""];
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const lines = wrapText(ctx, text, maxWidth, maxLines);
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}

function drawPill(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fill: string, color: string) {
  ctx.save();
  ctx.font = "700 28px Arial, sans-serif";
  const width = Math.min(420, ctx.measureText(text).width + 44);
  fillRoundedRect(ctx, x, y, width, 58, 29, fill);
  ctx.fillStyle = color;
  ctx.fillText(text, x + 22, y + 38);
  ctx.restore();
  return width;
}

function drawPostcardCanvas(
  ctx: CanvasRenderingContext2D,
  draft: PostcardDraft,
  preset: PostcardPreset,
  background: HTMLImageElement,
  subject: HTMLImageElement | null,
  day: number,
) {
  const width = 1080;
  const height = 1440;
  const paperGradient = ctx.createLinearGradient(0, 0, width, height);
  paperGradient.addColorStop(0, "#fffaf4");
  paperGradient.addColorStop(0.46, "#ffe4db");
  paperGradient.addColorStop(1, "#f7d5c1");
  ctx.fillStyle = paperGradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.09;
  ctx.strokeStyle = "#7d4a52";
  ctx.lineWidth = 2;
  for (let y = 28; y < height; y += 34) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y + 28);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.font = "800 28px Arial, sans-serif";
  ctx.fillStyle = "#9f6268";
  ctx.letterSpacing = "3px";
  ctx.fillText("POSTAL VIVA", 72, 82);
  ctx.font = "700 24px Arial, sans-serif";
  ctx.letterSpacing = "0px";
  ctx.fillStyle = "#bd7478";
  ctx.fillText(`Día ${day}`, 72, 118);
  ctx.restore();

  ctx.save();
  ctx.translate(884, 58);
  ctx.setLineDash([12, 10]);
  ctx.strokeStyle = "rgba(123, 73, 79, 0.55)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(70, 70, 58, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(255, 255, 255, 0.62)";
  ctx.beginPath();
  ctx.arc(70, 70, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "800 24px Arial, sans-serif";
  ctx.fillStyle = "#a94d57";
  ctx.textAlign = "center";
  ctx.fillText("PARA", 70, 64);
  ctx.fillText("BENYU", 70, 94);
  ctx.restore();

  fillRoundedRect(ctx, 62, 154, 956, 614, 50, "#ffffff");
  ctx.save();
  ctx.beginPath();
  roundedPath(ctx, 86, 178, 908, 566, 38);
  ctx.clip();
  drawCoverImage(ctx, background, 86, 178, 908, 566);
  const overlay = ctx.createLinearGradient(86, 178, 994, 744);
  overlay.addColorStop(0, "rgba(255, 255, 255, 0.06)");
  overlay.addColorStop(0.5, "rgba(31, 22, 31, 0.04)");
  overlay.addColorStop(1, "rgba(31, 18, 24, 0.34)");
  ctx.fillStyle = overlay;
  ctx.fillRect(86, 178, 908, 566);

  if (subject) {
    drawContainImage(ctx, subject, 150, 230, 780, 510);
  }
  ctx.restore();

  strokeRoundedRect(ctx, 62, 154, 956, 614, 50, "rgba(255, 255, 255, 0.78)", 10);

  ctx.save();
  ctx.font = "800 30px Arial, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(55, 30, 36, 0.35)";
  ctx.shadowBlur = 14;
  ctx.fillText(draft.place ? `Desde ${draft.place}` : "Desde Israel", 112, 704);
  ctx.restore();

  fillRoundedRect(ctx, 62, 812, 956, 538, 44, "rgba(255, 255, 255, 0.9)");
  strokeRoundedRect(ctx, 62, 812, 956, 538, 44, "rgba(255, 255, 255, 0.86)", 4);

  ctx.fillStyle = preset.accent;
  ctx.font = "800 24px Arial, sans-serif";
  ctx.fillText(preset.eyebrow.toUpperCase(), 118, 888);

  ctx.fillStyle = "#4f3338";
  ctx.font = "700 58px Georgia, serif";
  ctx.fillText("Postal para Benyu", 118, 958);

  ctx.fillStyle = "#8b686c";
  ctx.font = "700 30px Arial, sans-serif";
  ctx.fillText(draft.mood, 118, 1012);

  ctx.fillStyle = "#55393e";
  ctx.font = "500 46px Georgia, serif";
  const messageStartY = drawWrappedText(ctx, draft.message || "Hoy pensé en vos.", 118, 1092, 824, 58, 4);

  ctx.fillStyle = "#a15f66";
  ctx.font = "700 31px Arial, sans-serif";
  ctx.fillText(`- ${draft.signature || "Danu"}`, 118, Math.min(messageStartY + 62, 1302));

  let pillX = 118;
  const pillY = 1268;
  draft.stickers.forEach((sticker, index) => {
    if (index > 0 && pillX > 740) return;
    const width = drawPill(ctx, sticker, pillX, pillY, "rgba(216, 95, 101, 0.12)", "#a74751");
    pillX += width + 14;
  });

  ctx.save();
  ctx.strokeStyle = "rgba(137, 94, 99, 0.28)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(118, 1228);
  ctx.lineTo(964, 1228);
  ctx.stroke();
  ctx.restore();
}

async function createPostcardFile(draft: PostcardDraft, preset: PostcardPreset, photoUrl: string | null, day: number) {
  await document.fonts?.ready;

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1440;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudo crear la postal.");

  const [background, subject] = await Promise.all([
    loadImage(preset.image),
    photoUrl ? loadImage(photoUrl).catch(() => null) : Promise.resolve(null),
  ]);
  drawPostcardCanvas(context, draft, preset, background, subject, day);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("No se pudo exportar la postal."));
    }, "image/jpeg", 0.92);
  });

  const slug = new Date().toISOString().slice(0, 10);
  return new File([blob], `postal-danu-para-benyu-${slug}.jpg`, { type: "image/jpeg" });
}

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function openWhatsApp(text: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}

async function removePeopleBackground(file: File) {
  const originalUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(originalUrl);
    const { SelfieSegmentation } = await import("@mediapipe/selfie_segmentation");
    const segmenter = new SelfieSegmentation({
      locateFile: (path) => `/mediapipe/selfie_segmentation/${path}`,
    });

    segmenter.setOptions({ modelSelection: 1, selfieMode: false });

    const results = await new Promise<{ image: CanvasImageSource; segmentationMask: CanvasImageSource }>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("No se pudo recortar la imagen.")), 14000);

      segmenter.onResults((nextResults) => {
        window.clearTimeout(timeout);
        resolve(nextResults);
      });

      segmenter.send({ image }).catch((error) => {
        window.clearTimeout(timeout);
        reject(error);
      });
    });

    await segmenter.close().catch(() => undefined);

    const maxSize = 1400;
    const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.round(image.naturalWidth * scale);
    const height = Math.round(image.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo preparar el recorte.");

    context.clearRect(0, 0, width, height);
    context.save();
    context.filter = "blur(1.2px)";
    context.drawImage(results.segmentationMask, 0, 0, width, height);
    context.restore();
    context.globalCompositeOperation = "source-in";
    context.drawImage(image, 0, 0, width, height);
    context.globalCompositeOperation = "source-over";

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("No se pudo exportar el recorte."));
      }, "image/png");
    });
  } finally {
    URL.revokeObjectURL(originalUrl);
  }
}

const steps = [
  {
    title: "Fondo",
    shortTitle: "Fondo",
    eyebrow: "Paso 1 de 4",
    helper: "Elegí el clima visual de la postal. Si no suma foto después, este fondo queda como imagen principal.",
  },
  {
    title: "Momento",
    shortTitle: "Foto",
    eyebrow: "Paso 2 de 4",
    helper: "Subí una foto de ustedes. La app le saca el fondo y los pone sobre el paisaje que elegiste.",
  },
  {
    title: "Mensaje",
    shortTitle: "Texto",
    eyebrow: "Paso 3 de 4",
    helper: "Escribí algo cortito y elegí hasta tres stickers. Esto también viaja en el texto de WhatsApp.",
  },
  {
    title: "Enviar",
    shortTitle: "Enviar",
    eyebrow: "Paso 4 de 4",
    helper: "Generá el JPG y mandalo por WhatsApp. Si el celular no adjunta automático, descargalo y mandalo desde el chat.",
  },
] as const;

type StepIndex = 0 | 1 | 2 | 3;

const messageIdeas = [
  "Hoy pensé en vos cuando...",
  "Te mando este pedacito de mi día porque...",
  "Si estuvieras acá, te mostraría...",
  "El mejor momento de hoy fue...",
];

function MiniScenery({ preset, photoUrl, compact = false }: { preset: PostcardPreset; photoUrl: string | null; compact?: boolean }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#efe1d6]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={preset.image} alt="" aria-hidden className="h-full w-full object-cover" />
      <span className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.12),transparent_32%,rgba(29,16,24,0.36))]" />
      {photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt="Foto recortada"
          className={`absolute left-1/2 bottom-[-1%] -translate-x-1/2 object-contain drop-shadow-[0_12px_20px_rgba(25,15,18,0.36)] ${
            compact ? "max-h-[88%] max-w-[86%]" : "max-h-[82%] max-w-[86%]"
          }`}
        />
      )}
    </div>
  );
}

function PostcardPreview({ draft, preset, photoUrl, generatedUrl }: { draft: PostcardDraft; preset: PostcardPreset; photoUrl: string | null; generatedUrl?: string }) {
  return (
    <div className="mx-auto w-full max-w-[265px] sm:max-w-[330px]">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[1.75rem] border border-white/95 bg-white p-2.5 shadow-[0_18px_45px_rgba(86,45,50,0.16)] sm:p-3">
        {generatedUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={generatedUrl} alt="Postal generada en JPG" className="h-full w-full rounded-[1.25rem] object-cover" />
        ) : (
          <div className="relative h-full overflow-hidden rounded-[1.25rem] bg-white">
            <div className="h-[50%] overflow-hidden">
              <MiniScenery preset={preset} photoUrl={photoUrl} />
            </div>
            <div className="absolute inset-x-3 bottom-3 rounded-[1.1rem] bg-white/92 p-3 shadow-lg backdrop-blur-sm sm:inset-x-4 sm:bottom-4 sm:p-4">
              <p className="text-[8px] font-black uppercase tracking-[0.16em] sm:text-[9px]" style={{ color: preset.accent }}>{preset.eyebrow}</p>
              <p className="font-display mt-1 text-[1.55rem] font-semibold leading-none text-[#503237] sm:text-2xl">Postal para Benyu</p>
              <p className="mt-2 text-[11px] font-bold text-[#8b686c] sm:text-xs">{draft.place ? `Desde ${draft.place}` : "Desde Israel"} · {draft.mood}</p>
              <p className="mt-3 line-clamp-3 text-xs font-semibold leading-5 text-[#60454a] sm:text-sm">{draft.message || "Hoy pensé en vos."}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {draft.stickers.map((sticker) => (
                  <span key={sticker} className="rounded-full bg-[#f6ded9] px-2 py-1 text-[9px] font-black text-[#a74751] sm:px-2.5 sm:text-[10px]">{sticker}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ activeStep, onStepSelect }: { activeStep: StepIndex; onStepSelect: (step: StepIndex) => void }) {
  return (
    <div className="mt-5 grid grid-cols-4 gap-1.5 rounded-2xl bg-white/62 p-1.5">
      {steps.map((step, index) => {
        const selected = index === activeStep;
        return (
          <button
            key={step.title}
            type="button"
            aria-current={selected ? "step" : undefined}
            onClick={() => onStepSelect(index as StepIndex)}
            className={`min-h-12 rounded-xl px-1.5 text-center transition ${
              selected ? "bg-[#d85f65] text-white shadow-sm" : "text-[#8b686c] hover:bg-white/80"
            }`}
          >
            <span className="block text-[10px] font-black">{index + 1}</span>
            <span className="block text-[10px] font-extrabold sm:text-xs">{step.shortTitle}</span>
          </button>
        );
      })}
    </div>
  );
}

function MobileStepPreview({ draft, preset, photoUrl, generatedUrl }: { draft: PostcardDraft; preset: PostcardPreset; photoUrl: string | null; generatedUrl?: string }) {
  return (
    <div className="rounded-[1.75rem] border border-white bg-white/72 p-3 shadow-sm lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a16d72]">Vista previa</p>
        <span className="rounded-full bg-[#f3ded9] px-3 py-1 text-[10px] font-black text-[#a74751]">{generatedUrl ? "JPG listo" : "En vivo"}</span>
      </div>
      <div className="mt-3">
        <PostcardPreview draft={draft} preset={preset} photoUrl={photoUrl} generatedUrl={generatedUrl} />
      </div>
    </div>
  );
}

function StepHelp({ activeStep }: { activeStep: StepIndex }) {
  const step = steps[activeStep];
  return (
    <div className="rounded-[1.5rem] border border-white bg-white/62 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c35b63]">{step.eyebrow}</p>
      <h4 className="font-display mt-1 text-3xl font-semibold leading-none text-[#503237]">{step.title}</h4>
      <p className="mt-3 text-sm font-semibold leading-6 text-[#76585c]">{step.helper}</p>
    </div>
  );
}

function SendInstructions() {
  return (
    <div className="rounded-[1.5rem] border border-[#f1d5cf] bg-white/82 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a16d72]">Cómo mandarla</p>
      <ol className="mt-3 space-y-3 text-sm font-semibold leading-6 text-[#62484c]">
        <li className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d85f65] text-xs font-black text-white">1</span>
          <span>Tocá <span className="font-black">Generar JPG</span>. La app une el fondo, la foto recortada y tu mensaje.</span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d85f65] text-xs font-black text-white">2</span>
          <span>Tocá <span className="font-black">Compartir JPG</span>, elegí WhatsApp y buscame a mí.</span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d85f65] text-xs font-black text-white">3</span>
          <span>Mandá la postal. Si WhatsApp no pega el texto solo, usá <span className="font-black">Copiar texto</span> y pegalo en el chat.</span>
        </li>
      </ol>
    </div>
  );
}

export function PostcardCreator({ config: configProp, day }: PostcardCreatorProps) {
  const config = configProp ?? defaultConfig;
  const defaultDraft = useMemo(() => getDefaultDraft(config), [config]);
  const storageKey = useMemo(() => `day-${day}-postcard-draft`, [day]);
  const [draft, setDraft] = useState<PostcardDraft>(defaultDraft);
  const [activeStep, setActiveStep] = useState<StepIndex>(0);
  const [ready, setReady] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [generated, setGenerated] = useState<GeneratedPostcard | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const rootRef = useRef<HTMLElement>(null);
  const photoUrlRef = useRef<string | null>(null);
  const generatedUrlRef = useRef<string | null>(null);

  const preset = presets.find((item) => item.id === draft.presetId) ?? presets[0];
  const generatedUrl = generated?.url;
  const shellBackground: CSSProperties = {
    background:
      `linear-gradient(145deg, rgba(255,255,255,0.96), rgba(255,250,246,0.9)), ` +
      `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]}, ${preset.colors[2]})`,
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
        setDraft(sanitizeDraft(saved, defaultDraft));
      } catch {
        setDraft(defaultDraft);
      }
      setReady(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [defaultDraft, storageKey]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [draft, ready, storageKey]);

  useEffect(() => {
    return () => {
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
      if (generatedUrlRef.current) URL.revokeObjectURL(generatedUrlRef.current);
    };
  }, []);

  const clearGeneratedResult = () => {
    if (generatedUrlRef.current) {
      URL.revokeObjectURL(generatedUrlRef.current);
      generatedUrlRef.current = null;
    }
    setGenerated(null);
  };

  const updateDraft = (patch: Partial<PostcardDraft>) => {
    clearGeneratedResult();
    setStatus("");
    setDraft((current) => ({ ...current, ...patch }));
  };

  const toggleSticker = (sticker: string) => {
    clearGeneratedResult();
    setStatus("");
    setDraft((current) => {
      if (current.stickers.includes(sticker)) {
        return { ...current, stickers: current.stickers.filter((item) => item !== sticker) };
      }
      if (current.stickers.length >= 3) return current;
      return { ...current, stickers: [...current.stickers, sticker] };
    });
  };

  const setGeneratedResult = (file: File) => {
    if (generatedUrlRef.current) URL.revokeObjectURL(generatedUrlRef.current);
    const url = URL.createObjectURL(file);
    generatedUrlRef.current = url;
    setGenerated({ file, url });
  };

  const goToStep = (step: StepIndex) => {
    setActiveStep(step);
    window.setTimeout(() => rootRef.current?.scrollIntoView({ block: "start", behavior: "smooth" }), 0);
  };

  const goNext = () => {
    if (activeStep < 3) goToStep((activeStep + 1) as StepIndex);
  };

  const goBack = () => {
    if (activeStep > 0) goToStep((activeStep - 1) as StepIndex);
  };

  const createImage = async () => {
    setBusy(true);
    setStatus("Generando postal...");
    try {
      const file = await createPostcardFile(draft, preset, photoUrl, day);
      setGeneratedResult(file);
      setStatus("Postal lista en JPG.");
      return file;
    } catch {
      setStatus("No pude generar el JPG. Probá de nuevo.");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const buildShareText = () => {
    const place = draft.place.trim() ? `\nDesde ${draft.place.trim()}.` : "";
    const message = draft.message.trim() ? `\n\n${draft.message.trim()}` : "";
    return `${config.shareText}${place}${message}`;
  };

  const copyShareText = async () => {
    try {
      await navigator.clipboard.writeText(buildShareText());
      setStatus("Texto copiado. Pegalo en WhatsApp junto a la postal.");
    } catch {
      setStatus("No pude copiarlo automáticamente. Podés seleccionar el texto y copiarlo.");
    }
  };

  const shareImage = async () => {
    const file = generated?.file ?? await createImage();
    if (!file) return;

    const shareData: ShareData = {
      title: "Postal viva para Benyu",
      text: buildShareText(),
      files: [file],
    };

    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
        await navigator.share(shareData);
        setStatus("Postal compartida.");
        return;
      }
      downloadFile(file);
      openWhatsApp(buildShareText());
      setStatus("Te descargué el JPG y abrí WhatsApp.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus("Compartir cancelado.");
        return;
      }
      downloadFile(file);
      openWhatsApp(buildShareText());
      setStatus("Te descargué el JPG y abrí WhatsApp.");
    }
  };

  const downloadImage = async () => {
    const file = generated?.file ?? await createImage();
    if (!file) return;
    downloadFile(file);
    setStatus("JPG descargado.");
  };

  const choosePhoto = async (file?: File) => {
    clearGeneratedResult();
    setStatus("");

    if (photoUrlRef.current) {
      URL.revokeObjectURL(photoUrlRef.current);
      photoUrlRef.current = null;
    }

    if (!file) {
      setPhotoUrl(null);
      setPhotoName("");
      return;
    }

    setPhotoName(file.name);
    setProcessingPhoto(true);
    setStatus("Sacando el fondo de la foto...");

    try {
      const cutout = await removePeopleBackground(file);
      const nextUrl = URL.createObjectURL(cutout);
      photoUrlRef.current = nextUrl;
      setPhotoUrl(nextUrl);
      setStatus("Listo: ya los recorté y los puse sobre el fondo.");
    } catch {
      setPhotoName("");
      setPhotoUrl(null);
      setStatus("No pude recortar esa foto. Probá con una imagen donde ustedes se vean claros.");
    } finally {
      setProcessingPhoto(false);
    }
  };

  const stickerLimitReached = draft.stickers.length >= 3;
  const shareText = buildShareText();

  return (
    <section ref={rootRef} className="overflow-hidden rounded-[2rem] border border-white p-3 shadow-[0_18px_55px_rgba(103,54,59,0.1)] sm:p-5" style={shellBackground}>
      <div className="rounded-[1.75rem] border border-white/82 bg-white/64 p-4 shadow-sm backdrop-blur-md sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d85f65] text-white shadow-[0_9px_22px_rgba(216,95,101,0.28)]">
            <HeartIcon className="heartbeat h-6 w-6" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c35b63]">Correo urgente para Benyu</p>
            <h3 className="font-display mt-1 text-3xl font-semibold leading-none text-[#503237] sm:text-4xl">Tu postal viva</h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#76585c]">{config.prompt}</p>
          </div>
        </div>
        <StepIndicator activeStep={activeStep} onStepSelect={goToStep} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-6">
        <div className="space-y-4">
          <StepHelp activeStep={activeStep} />
          <MobileStepPreview draft={draft} preset={preset} photoUrl={photoUrl} generatedUrl={generatedUrl} />

          {status && activeStep !== 3 && (
            <p className="rounded-2xl bg-white/78 px-4 py-3 text-center text-xs font-bold leading-5 text-[#8a6266]" aria-live="polite">{status}</p>
          )}

          {activeStep === 0 && (
            <div className="grid gap-3">
              {presets.map((item) => {
                const selected = item.id === draft.presetId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => updateDraft({ presetId: item.id })}
                    className={`grid min-h-28 grid-cols-[92px_minmax(0,1fr)] items-stretch gap-3 rounded-[1.35rem] border p-2 text-left transition active:scale-[0.99] sm:grid-cols-[120px_minmax(0,1fr)] ${
                      selected ? "border-[#d85f65] bg-white shadow-[0_10px_26px_rgba(168,65,76,0.13)]" : "border-white/80 bg-white/62 hover:bg-white"
                    }`}
                  >
                    <span className="overflow-hidden rounded-[1rem]">
                      <MiniScenery preset={item} photoUrl={null} compact />
                    </span>
                    <span className="flex min-w-0 flex-col justify-center pr-1">
                      <span className="block text-base font-extrabold text-[#503237]">{item.label}</span>
                      <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: item.accent }}>{item.eyebrow}</span>
                      <span className="mt-2 block text-xs font-semibold leading-5 text-[#8c7174]">{item.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {activeStep === 1 && (
            <div className="space-y-4">
              <label className="block cursor-pointer rounded-[1.5rem] border border-white bg-white/70 p-3 shadow-sm transition hover:bg-white">
                <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-[#a16d72]">Foto nuestra</span>
                <span className="mt-2 grid min-h-48 place-items-center overflow-hidden rounded-[1.2rem] border border-dashed border-[#e7bebb] bg-[#fff8f3] text-center">
                  {processingPhoto ? (
                    <span className="px-5">
                      <SparkleIcon className="sparkle mx-auto h-8 w-8 text-[#d85f65]" />
                      <span className="mt-3 block text-base font-black text-[#503237]">Sacando fondo...</span>
                      <span className="mt-2 block text-xs font-semibold leading-5 text-[#8c7174]">Esto puede tardar unos segundos la primera vez.</span>
                    </span>
                  ) : photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoUrl} alt="Foto recortada para la postal" className="h-full max-h-64 w-full object-contain drop-shadow-[0_12px_18px_rgba(68,42,48,0.28)]" />
                  ) : (
                    <span className="px-5">
                      <SparkleIcon className="mx-auto h-8 w-8 text-[#d85f65]" />
                      <span className="mt-3 block text-base font-black text-[#503237]">Subir foto de ustedes</span>
                      <span className="mt-2 block text-xs font-semibold leading-5 text-[#8c7174]">La app les saca el fondo y los pone sobre el paisaje elegido.</span>
                    </span>
                  )}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={processingPhoto}
                  onChange={(event) => void choosePhoto(event.target.files?.[0])}
                />
              </label>

              {photoName && (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white bg-white/70 px-4 py-3">
                  <p className="min-w-0 truncate text-xs font-bold text-[#76585c]">{photoName}</p>
                  <button type="button" onClick={() => void choosePhoto()} className="shrink-0 rounded-full bg-[#f2ddd8] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#9e525b]">
                    Sacar
                  </button>
                </div>
              )}

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a16d72]">Desde dónde llega</span>
                <input
                  value={draft.place}
                  onChange={(event) => updateDraft({ place: event.target.value.slice(0, 42) })}
                  maxLength={42}
                  placeholder="Ej: Jerusalem, Israel"
                  className="mt-2 w-full rounded-2xl border border-[#efd1cb] bg-white/82 px-4 py-3.5 text-base font-bold text-[#503237] outline-none transition placeholder:text-[#b89b9b] focus:border-[#d85f65] focus:bg-white"
                />
              </label>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a16d72]">Mood de hoy</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {moods.map((mood) => (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => updateDraft({ mood })}
                      className={`min-h-12 rounded-2xl border px-3 text-sm font-extrabold transition ${
                        draft.mood === mood ? "border-[#d85f65] bg-[#d85f65] text-white" : "border-white bg-white/74 text-[#68484c] hover:bg-white"
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a16d72]">Ideas rápidas</p>
                <div className="mt-3 grid gap-2">
                  {messageIdeas.map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => updateDraft({ message: idea })}
                      className="rounded-2xl border border-white bg-white/74 px-4 py-3 text-left text-sm font-bold text-[#68484c] transition hover:bg-white"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a16d72]">Texto de la postal</span>
                <textarea
                  value={draft.message}
                  onChange={(event) => updateDraft({ message: event.target.value.slice(0, 170) })}
                  maxLength={170}
                  rows={6}
                  placeholder="Escribí algo que quieras mandarle a Benyu..."
                  className="mt-2 w-full resize-none rounded-2xl border border-[#efd1cb] bg-white/82 px-4 py-3 text-base font-semibold leading-7 text-[#503237] outline-none transition placeholder:text-[#b89b9b] focus:border-[#d85f65] focus:bg-white"
                />
                <span className="mt-1 block text-right text-[10px] font-bold text-[#a16d72]">{draft.message.length}/170</span>
              </label>

              <div>
                <div className="flex items-end justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a16d72]">Stickers</p>
                  <p className="text-[10px] font-bold text-[#a16d72]">{draft.stickers.length}/3</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {stickerOptions.map((sticker) => {
                    const selected = draft.stickers.includes(sticker);
                    const disabled = !selected && stickerLimitReached;
                    return (
                      <button
                        key={sticker}
                        type="button"
                        aria-pressed={selected}
                        disabled={disabled}
                        onClick={() => toggleSticker(sticker)}
                        className={`min-h-10 rounded-full border px-3 py-2 text-xs font-extrabold transition ${
                          selected
                            ? "border-[#d85f65] bg-[#d85f65] text-white shadow-sm"
                            : "border-white bg-white/78 text-[#68484c] hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                        }`}
                      >
                        {sticker}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a16d72]">Firma</span>
                <input
                  value={draft.signature}
                  onChange={(event) => updateDraft({ signature: event.target.value.slice(0, 28) })}
                  maxLength={28}
                  className="mt-2 w-full rounded-2xl border border-[#efd1cb] bg-white/82 px-4 py-3.5 text-base font-bold text-[#503237] outline-none transition placeholder:text-[#b89b9b] focus:border-[#d85f65] focus:bg-white"
                />
              </label>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4">
              <SendInstructions />

              <div className="rounded-[1.5rem] border border-white bg-white/72 p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a16d72]">Texto para WhatsApp</p>
                <p className="mt-3 whitespace-pre-line rounded-2xl bg-[#fff7f2] px-4 py-3 text-sm font-semibold leading-6 text-[#62484c]">{shareText}</p>
              </div>

              <div className="rounded-[1.75rem] border border-white bg-white/78 p-4 shadow-sm">
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={generated ? shareImage : createImage}
                    disabled={busy || processingPhoto}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#d85f65] px-5 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(216,95,101,0.25)] transition hover:-translate-y-0.5 hover:bg-[#c64f58] disabled:translate-y-0 disabled:cursor-wait disabled:opacity-70"
                  >
                    {generated ? <HeartIcon className="h-4 w-4" /> : <SparkleIcon className="h-4 w-4" />}
                    {busy ? "Preparando..." : generated ? "Compartir JPG" : "Generar JPG"}
                  </button>

                  {generated && (
                    <div className="grid gap-2 sm:grid-cols-3">
                      <button
                        type="button"
                        onClick={downloadImage}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#efd1cb] bg-white px-4 py-2.5 text-xs font-black text-[#68484c] transition hover:bg-[#fff7f2]"
                      >
                        <CheckIcon className="h-4 w-4" />
                        Descargar
                      </button>
                      <button
                        type="button"
                        onClick={copyShareText}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#efd1cb] bg-white px-4 py-2.5 text-xs font-black text-[#68484c] transition hover:bg-[#fff7f2]"
                      >
                        Copiar texto
                      </button>
                      <button
                        type="button"
                        onClick={() => openWhatsApp(shareText)}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#efd1cb] bg-white px-4 py-2.5 text-xs font-black text-[#68484c] transition hover:bg-[#fff7f2]"
                      >
                        WhatsApp
                      </button>
                    </div>
                  )}
                </div>

                {status && (
                  <p className="mt-3 rounded-2xl bg-[#fff5ef] px-4 py-3 text-center text-xs font-bold leading-5 text-[#8a6266]" aria-live="polite">{status}</p>
                )}
              </div>
            </div>
          )}

          <div className="sticky bottom-0 z-10 -mx-3 mt-3 border-t border-white/70 bg-[#fffaf6]/88 px-3 py-3 backdrop-blur-md sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:border-t-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-0">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
              <button
                type="button"
                onClick={goBack}
                disabled={activeStep === 0 || busy || processingPhoto}
                className="min-h-12 rounded-2xl border border-[#efd1cb] bg-white/86 px-4 text-sm font-black text-[#68484c] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                Atrás
              </button>
              {activeStep < 3 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={busy || processingPhoto}
                  className="min-h-12 rounded-2xl bg-[#d85f65] px-5 text-sm font-black text-white shadow-[0_10px_24px_rgba(216,95,101,0.25)] transition hover:-translate-y-0.5 hover:bg-[#c64f58] disabled:cursor-wait disabled:opacity-70"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={generated ? shareImage : createImage}
                  disabled={busy || processingPhoto}
                  className="min-h-12 rounded-2xl bg-[#d85f65] px-5 text-sm font-black text-white shadow-[0_10px_24px_rgba(216,95,101,0.25)] transition hover:-translate-y-0.5 hover:bg-[#c64f58] disabled:cursor-wait disabled:opacity-70"
                >
                  {busy ? "Preparando..." : generated ? "Compartir JPG" : "Generar JPG"}
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-4 space-y-4 rounded-[1.75rem] border border-white bg-white/58 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a16d72]">Vista previa</p>
              <span className="rounded-full bg-[#f3ded9] px-3 py-1 text-[10px] font-black text-[#a74751]">{generated ? "JPG listo" : "En vivo"}</span>
            </div>
            <PostcardPreview draft={draft} preset={preset} photoUrl={photoUrl} generatedUrl={generatedUrl} />

            {activeStep !== 3 && (
              <div className="rounded-[1.35rem] bg-white/70 p-4">
                <p className="text-xs font-bold leading-5 text-[#76585c]">Cuando llegues al último paso, esta preview se convierte en un JPG para mandarlo por WhatsApp.</p>
              </div>
            )}

            {activeStep === 3 && generated && (
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={shareImage}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#d85f65] px-4 py-2.5 text-sm font-black text-white shadow-[0_10px_24px_rgba(216,95,101,0.25)] transition hover:bg-[#c64f58]"
                >
                  <HeartIcon className="h-4 w-4" />
                  Compartir JPG
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={downloadImage}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#efd1cb] bg-white px-4 py-2.5 text-xs font-black text-[#68484c] transition hover:bg-[#fff7f2]"
                  >
                    Descargar
                  </button>
                  <button
                    type="button"
                    onClick={copyShareText}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#efd1cb] bg-white px-4 py-2.5 text-xs font-black text-[#68484c] transition hover:bg-[#fff7f2]"
                  >
                    Copiar texto
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
