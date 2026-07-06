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
  },
  {
    id: "desert",
    label: "Desierto suave",
    eyebrow: "arena, calma y aventura",
    description: "Para un día de ruta, paisaje abierto o momento tranquilo.",
    colors: ["#be7347", "#f0c987", "#4c827b"],
    accent: "#aa5548",
    ink: "#4a3027",
  },
  {
    id: "telaviv",
    label: "Mar de Tel Aviv",
    eyebrow: "agua, aire y sol",
    description: "Más fresca, perfecta para foto linda o día con energía.",
    colors: ["#2685b5", "#f3bd61", "#fff1d7"],
    accent: "#147d94",
    ink: "#213843",
  },
  {
    id: "shabbat",
    label: "Noche de Shabat",
    eyebrow: "velitas lejos",
    description: "Oscura, íntima y especial para un mensaje más tierno.",
    colors: ["#182b58", "#845278", "#ffd19b"],
    accent: "#d98c7a",
    ink: "#fdf1e6",
  },
  {
    id: "camino",
    label: "Camino nuevo",
    eyebrow: "pasitos de viaje",
    description: "Para contar algo que pasó, una anécdota o un mini logro.",
    colors: ["#c95261", "#eca067", "#5e9888"],
    accent: "#ad4050",
    ink: "#3f3032",
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

function drawScenery(ctx: CanvasRenderingContext2D, preset: PostcardPreset, x: number, y: number, width: number, height: number) {
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, preset.colors[0]);
  gradient.addColorStop(0.54, preset.colors[1]);
  gradient.addColorStop(1, preset.colors[2]);
  fillRoundedRect(ctx, x, y, width, height, 44, gradient);

  ctx.save();
  ctx.beginPath();
  roundedPath(ctx, x, y, width, height, 44);
  ctx.clip();

  ctx.globalAlpha = 0.26;
  for (let i = 0; i < 34; i += 1) {
    const dotX = x + ((i * 157) % width);
    const dotY = y + ((i * 89) % height);
    ctx.beginPath();
    ctx.arc(dotX, dotY, 2 + (i % 3), 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  if (preset.id === "telaviv") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
    ctx.beginPath();
    ctx.arc(x + width * 0.78, y + height * 0.22, 70, 0, Math.PI * 2);
    ctx.fill();

    for (let wave = 0; wave < 4; wave += 1) {
      ctx.beginPath();
      ctx.strokeStyle = wave % 2 ? "rgba(255, 255, 255, 0.55)" : "rgba(33, 56, 67, 0.22)";
      ctx.lineWidth = 10;
      const waveY = y + height * (0.58 + wave * 0.1);
      ctx.moveTo(x - 20, waveY);
      for (let t = 0; t <= width + 40; t += 46) {
        ctx.quadraticCurveTo(x + t + 23, waveY - 24, x + t + 46, waveY);
      }
      ctx.stroke();
    }
  } else if (preset.id === "desert") {
    for (let dune = 0; dune < 3; dune += 1) {
      ctx.beginPath();
      ctx.fillStyle = dune === 0 ? "rgba(255, 240, 207, 0.75)" : dune === 1 ? "rgba(145, 90, 58, 0.24)" : "rgba(75, 96, 88, 0.24)";
      const duneY = y + height * (0.58 + dune * 0.12);
      ctx.moveTo(x - 40, y + height);
      ctx.quadraticCurveTo(x + width * 0.26, duneY - 70, x + width * 0.58, duneY);
      ctx.quadraticCurveTo(x + width * 0.82, duneY + 70, x + width + 40, duneY - 30);
      ctx.lineTo(x + width + 40, y + height + 40);
      ctx.lineTo(x - 40, y + height + 40);
      ctx.fill();
    }
  } else if (preset.id === "shabbat") {
    ctx.fillStyle = "rgba(255, 238, 204, 0.72)";
    for (let i = 0; i < 24; i += 1) {
      const starX = x + 64 + ((i * 97) % (width - 128));
      const starY = y + 40 + ((i * 53) % Math.round(height * 0.46));
      ctx.beginPath();
      ctx.arc(starX, starY, i % 5 === 0 ? 4 : 2, 0, Math.PI * 2);
      ctx.fill();
    }
    fillRoundedRect(ctx, x + width * 0.32, y + height * 0.58, 38, 148, 18, "rgba(255, 247, 230, 0.8)");
    fillRoundedRect(ctx, x + width * 0.56, y + height * 0.58, 38, 148, 18, "rgba(255, 247, 230, 0.8)");
    ctx.fillStyle = "rgba(255, 205, 125, 0.95)";
    ctx.beginPath();
    ctx.ellipse(x + width * 0.34, y + height * 0.54, 18, 34, 0, 0, Math.PI * 2);
    ctx.ellipse(x + width * 0.58, y + height * 0.54, 18, 34, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (preset.id === "camino") {
    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 245, 226, 0.62)";
    ctx.moveTo(x + width * 0.46, y + height);
    ctx.quadraticCurveTo(x + width * 0.64, y + height * 0.58, x + width * 0.5, y + height * 0.22);
    ctx.quadraticCurveTo(x + width * 0.68, y + height * 0.64, x + width * 0.72, y + height);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(57, 91, 78, 0.25)";
    ctx.beginPath();
    ctx.moveTo(x, y + height * 0.72);
    ctx.quadraticCurveTo(x + width * 0.24, y + height * 0.52, x + width * 0.52, y + height * 0.72);
    ctx.quadraticCurveTo(x + width * 0.72, y + height * 0.88, x + width, y + height * 0.68);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.fill();
  } else {
    ctx.fillStyle = "rgba(255, 241, 214, 0.82)";
    ctx.beginPath();
    ctx.arc(x + width * 0.22, y + height * 0.52, 92, Math.PI, 0);
    ctx.rect(x + width * 0.22 - 92, y + height * 0.52, 184, 132);
    ctx.fill();
    ctx.fillStyle = "rgba(65, 48, 89, 0.28)";
    for (let i = 0; i < 7; i += 1) {
      const towerX = x + width * 0.1 + i * width * 0.12;
      const towerHeight = 90 + (i % 3) * 38;
      fillRoundedRect(ctx, towerX, y + height - towerHeight - 84, 72, towerHeight + 84, 20, "rgba(255, 248, 228, 0.54)");
      ctx.beginPath();
      ctx.moveTo(towerX, y + height - towerHeight - 84);
      ctx.lineTo(towerX + 36, y + height - towerHeight - 132);
      ctx.lineTo(towerX + 72, y + height - towerHeight - 84);
      ctx.fill();
    }
  }

  const shade = ctx.createLinearGradient(x, y + height * 0.45, x, y + height);
  shade.addColorStop(0, "rgba(0, 0, 0, 0)");
  shade.addColorStop(1, "rgba(0, 0, 0, 0.22)");
  ctx.fillStyle = shade;
  ctx.fillRect(x, y, width, height);
  ctx.restore();
}

function drawPostcardCanvas(
  ctx: CanvasRenderingContext2D,
  draft: PostcardDraft,
  preset: PostcardPreset,
  photo: HTMLImageElement | null,
  day: number,
) {
  const width = 1080;
  const height = 1440;
  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#fffaf4");
  background.addColorStop(0.46, "#ffe4db");
  background.addColorStop(1, "#f7d5c1");
  ctx.fillStyle = background;
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

  if (photo) {
    fillRoundedRect(ctx, 62, 154, 956, 614, 50, "#ffffff");
    ctx.save();
    ctx.beginPath();
    roundedPath(ctx, 86, 178, 908, 566, 38);
    ctx.clip();
    drawCoverImage(ctx, photo, 86, 178, 908, 566);
    const overlay = ctx.createLinearGradient(86, 178, 994, 744);
    overlay.addColorStop(0, "rgba(255, 255, 255, 0.04)");
    overlay.addColorStop(1, "rgba(58, 32, 40, 0.24)");
    ctx.fillStyle = overlay;
    ctx.fillRect(86, 178, 908, 566);
    ctx.restore();
  } else {
    drawScenery(ctx, preset, 62, 154, 956, 614);
  }

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

  const photo = photoUrl ? await loadImage(photoUrl).catch(() => null) : null;
  drawPostcardCanvas(context, draft, preset, photo, day);

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
    helper: "Sumá una foto del día o dejá el fondo ilustrado. Después completá desde dónde llega la postal.",
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
  const backgroundStyle: CSSProperties = {
    background:
      `radial-gradient(circle at 78% 18%, rgba(255, 255, 255, 0.62), transparent 16%), ` +
      `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]} 52%, ${preset.colors[2]})`,
  };

  if (photoUrl) {
    return (
      // Native img keeps user-picked local files simple and avoids Next image optimization.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photoUrl} alt="Foto elegida para la postal" className="h-full w-full object-cover" />
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden" style={backgroundStyle}>
      <span className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.18),transparent_34%,rgba(0,0,0,0.12))]" />

      {preset.id === "telaviv" && (
        <>
          <span className={`${compact ? "h-12 w-12" : "h-20 w-20"} absolute right-[14%] top-[13%] rounded-full bg-white/75 shadow-[0_0_24px_rgba(255,255,255,0.52)]`} />
          <span className="absolute bottom-[22%] left-[-10%] h-[18%] w-[122%] rounded-[100%] border-t-[10px] border-white/58" />
          <span className="absolute bottom-[12%] left-[-14%] h-[20%] w-[128%] rounded-[100%] border-t-[11px] border-[#1f6988]/32" />
          <span className="absolute bottom-[3%] left-[-8%] h-[20%] w-[118%] rounded-[100%] border-t-[10px] border-white/48" />
        </>
      )}

      {preset.id === "desert" && (
        <>
          <span className="absolute bottom-[-10%] left-[-18%] h-[38%] w-[88%] rounded-[100%] bg-[#fff0ce]/70" />
          <span className="absolute bottom-[-6%] right-[-16%] h-[42%] w-[92%] rounded-[100%] bg-[#8d5d46]/30" />
          <span className="absolute bottom-[8%] left-[18%] h-[30%] w-[96%] rounded-[100%] bg-[#49746e]/24" />
          <span className="absolute left-[16%] top-[20%] h-14 w-14 rounded-full bg-[#fff2cd]/75" />
        </>
      )}

      {preset.id === "shabbat" && (
        <>
          {Array.from({ length: compact ? 10 : 18 }, (_, index) => (
            <span
              key={index}
              className="absolute h-1.5 w-1.5 rounded-full bg-[#ffe3b7]/80"
              style={{ left: `${10 + ((index * 23) % 78)}%`, top: `${10 + ((index * 17) % 42)}%` }}
            />
          ))}
          <span className="absolute bottom-[14%] left-[32%] h-[30%] w-[8%] rounded-t-full bg-white/78" />
          <span className="absolute bottom-[14%] left-[57%] h-[30%] w-[8%] rounded-t-full bg-white/78" />
          <span className="absolute bottom-[43%] left-[31%] h-[12%] w-[10%] rounded-[100%] bg-[#ffd48f]" />
          <span className="absolute bottom-[43%] left-[56%] h-[12%] w-[10%] rounded-[100%] bg-[#ffd48f]" />
        </>
      )}

      {preset.id === "camino" && (
        <>
          <span className="absolute bottom-[-8%] left-[-20%] h-[42%] w-[84%] rounded-[100%] bg-[#325e56]/28" />
          <span className="absolute bottom-[-12%] right-[-20%] h-[45%] w-[88%] rounded-[100%] bg-[#fff0c9]/38" />
          <span className="absolute bottom-[-4%] left-[42%] h-[86%] w-[24%] rotate-[12deg] rounded-t-[100%] bg-[#fff7e4]/58" />
          <span className="absolute left-[18%] top-[17%] h-10 w-24 rounded-full bg-white/38" />
        </>
      )}

      {preset.id === "jerusalem" && (
        <>
          <span className="absolute left-[10%] top-[24%] h-[18%] w-[18%] rounded-t-full bg-[#fff0ce]/75" />
          <span className="absolute bottom-[14%] left-[8%] h-[34%] w-[16%] rounded-t-2xl bg-[#fff7dd]/58" />
          <span className="absolute bottom-[14%] left-[26%] h-[42%] w-[15%] rounded-t-2xl bg-[#fff7dd]/45" />
          <span className="absolute bottom-[14%] left-[44%] h-[30%] w-[17%] rounded-t-full bg-[#fff7dd]/66" />
          <span className="absolute bottom-[14%] left-[64%] h-[38%] w-[16%] rounded-t-2xl bg-[#fff7dd]/52" />
          <span className="absolute bottom-[14%] right-[5%] h-[28%] w-[14%] rounded-t-2xl bg-[#fff7dd]/44" />
          <span className="absolute bottom-[9%] left-0 h-[11%] w-full bg-[#3a3052]/22" />
        </>
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
          <span>Tocá <span className="font-black">Generar JPG</span>. La app arma la postal como imagen.</span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d85f65] text-xs font-black text-white">2</span>
          <span>Tocá <span className="font-black">Compartir JPG</span>, elegí WhatsApp y buscame a mí.</span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d85f65] text-xs font-black text-white">3</span>
          <span>Mandá la foto. Si WhatsApp no pega el texto solo, usá <span className="font-black">Copiar texto</span> y pegalo en el chat.</span>
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

  const choosePhoto = (file?: File) => {
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

    const nextUrl = URL.createObjectURL(file);
    photoUrlRef.current = nextUrl;
    setPhotoUrl(nextUrl);
    setPhotoName(file.name);
    setStatus("Foto lista para la postal.");
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
                <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-[#a16d72]">Foto del día</span>
                <span className="mt-2 grid min-h-48 place-items-center overflow-hidden rounded-[1.2rem] border border-dashed border-[#e7bebb] bg-[#fff8f3] text-center">
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoUrl} alt="Foto elegida para la postal" className="h-full max-h-64 w-full object-cover" />
                  ) : (
                    <span className="px-5">
                      <SparkleIcon className="mx-auto h-8 w-8 text-[#d85f65]" />
                      <span className="mt-3 block text-base font-black text-[#503237]">Elegir foto o sacarla ahora</span>
                      <span className="mt-2 block text-xs font-semibold leading-5 text-[#8c7174]">También podés seguir sin foto y usar el fondo ilustrado.</span>
                    </span>
                  )}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => choosePhoto(event.target.files?.[0])}
                />
              </label>

              {photoName && (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white bg-white/70 px-4 py-3">
                  <p className="min-w-0 truncate text-xs font-bold text-[#76585c]">{photoName}</p>
                  <button type="button" onClick={() => choosePhoto()} className="shrink-0 rounded-full bg-[#f2ddd8] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#9e525b]">
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
                    disabled={busy}
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
                disabled={activeStep === 0 || busy}
                className="min-h-12 rounded-2xl border border-[#efd1cb] bg-white/86 px-4 text-sm font-black text-[#68484c] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                Atrás
              </button>
              {activeStep < 3 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={busy}
                  className="min-h-12 rounded-2xl bg-[#d85f65] px-5 text-sm font-black text-white shadow-[0_10px_24px_rgba(216,95,101,0.25)] transition hover:-translate-y-0.5 hover:bg-[#c64f58] disabled:cursor-wait disabled:opacity-70"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={generated ? shareImage : createImage}
                  disabled={busy}
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
