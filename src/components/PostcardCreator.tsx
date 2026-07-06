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
    eyebrow: "luz antigua",
    colors: ["#f5c179", "#7d72bd", "#27476f"],
    accent: "#d85f65",
    ink: "#432c31",
  },
  {
    id: "desert",
    label: "Desierto suave",
    eyebrow: "calma de viaje",
    colors: ["#c98352", "#f2c88f", "#557f7d"],
    accent: "#b65a46",
    ink: "#4a3027",
  },
  {
    id: "telaviv",
    label: "Mar de Tel Aviv",
    eyebrow: "aire libre",
    colors: ["#2f8fbe", "#f7c66a", "#fff2df"],
    accent: "#177d93",
    ink: "#213843",
  },
  {
    id: "shabbat",
    label: "Noche de Shabat",
    eyebrow: "velitas lejos",
    colors: ["#1f315f", "#8b527f", "#ffd39f"],
    accent: "#d98c7a",
    ink: "#fdf1e6",
  },
  {
    id: "camino",
    label: "Camino nuevo",
    eyebrow: "modo aventura",
    colors: ["#c95d68", "#f0a36f", "#6c9b8d"],
    accent: "#b14252",
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

function PostcardPreview({ draft, preset, photoUrl }: { draft: PostcardDraft; preset: PostcardPreset; photoUrl: string | null }) {
  const backgroundStyle: CSSProperties = {
    background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]} 52%, ${preset.colors[2]})`,
  };

  return (
    <div className="mx-auto w-full max-w-[340px]">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[1.75rem] border border-white/90 bg-white p-3 shadow-[0_18px_45px_rgba(86,45,50,0.16)]">
        <div className="relative h-full overflow-hidden rounded-[1.25rem]" style={backgroundStyle}>
          {photoUrl ? (
            // Native img keeps user-picked local files simple and avoids Next image optimization.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="Foto elegida para la postal" className="h-[52%] w-full object-cover" />
          ) : (
            <div className="relative h-[52%] overflow-hidden">
              <span className="absolute right-8 top-8 h-16 w-16 rounded-full bg-white/70" />
              <span className="absolute bottom-8 left-[-12%] h-24 w-[72%] rounded-[100%] bg-white/36" />
              <span className="absolute bottom-3 right-[-8%] h-28 w-[78%] rounded-[100%] bg-black/12" />
              <SparkleIcon className="sparkle absolute left-10 top-12 h-5 w-5 text-white/80" />
            </div>
          )}
          <div className="absolute inset-x-4 bottom-4 rounded-[1.1rem] bg-white/90 p-4 shadow-lg backdrop-blur-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: preset.accent }}>{preset.eyebrow}</p>
            <p className="font-display mt-1 text-2xl font-semibold leading-none text-[#503237]">Postal para Benyu</p>
            <p className="mt-2 text-xs font-bold text-[#8b686c]">{draft.place ? `Desde ${draft.place}` : "Desde Israel"} · {draft.mood}</p>
            <p className="mt-3 line-clamp-3 text-sm font-semibold leading-5 text-[#60454a]">{draft.message || "Hoy pensé en vos."}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {draft.stickers.map((sticker) => (
                <span key={sticker} className="rounded-full bg-[#f6ded9] px-2.5 py-1 text-[10px] font-black text-[#a74751]">{sticker}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PostcardCreator({ config: configProp, day }: PostcardCreatorProps) {
  const config = configProp ?? defaultConfig;
  const defaultDraft = useMemo(() => getDefaultDraft(config), [config]);
  const storageKey = useMemo(() => `day-${day}-postcard-draft`, [day]);
  const [draft, setDraft] = useState<PostcardDraft>(defaultDraft);
  const [ready, setReady] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [generated, setGenerated] = useState<GeneratedPostcard | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const photoUrlRef = useRef<string | null>(null);
  const generatedUrlRef = useRef<string | null>(null);

  const preset = presets.find((item) => item.id === draft.presetId) ?? presets[0];

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
  };

  const stickerLimitReached = draft.stickers.length >= 3;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white bg-gradient-to-br from-white/95 via-[#fff8f0] to-[#f9dfda] p-4 shadow-[0_18px_55px_rgba(103,54,59,0.1)] sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d85f65] text-white shadow-[0_9px_22px_rgba(216,95,101,0.28)]">
          <HeartIcon className="heartbeat h-6 w-6" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c35b63]">Correo urgente para Benyu</p>
          <h3 className="font-display mt-1 text-3xl font-semibold leading-none text-[#503237]">Tu postal viva</h3>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#76585c]">{config.prompt}</p>
        </div>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a16d72]">Estilo</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {presets.map((item) => {
                const selected = item.id === draft.presetId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => updateDraft({ presetId: item.id })}
                    className={`flex min-h-16 items-center gap-3 rounded-2xl border px-3 py-2 text-left transition ${
                      selected ? "border-[#d85f65] bg-white shadow-sm" : "border-white/80 bg-white/62 hover:bg-white"
                    }`}
                  >
                    <span className="h-9 w-9 shrink-0 rounded-xl shadow-inner" style={{ background: `linear-gradient(135deg, ${item.colors[0]}, ${item.colors[1]}, ${item.colors[2]})` }} />
                    <span>
                      <span className="block text-sm font-extrabold text-[#503237]">{item.label}</span>
                      <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#a16d72]">{item.eyebrow}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a16d72]">Estoy en</span>
              <input
                value={draft.place}
                onChange={(event) => updateDraft({ place: event.target.value.slice(0, 42) })}
                maxLength={42}
                className="mt-2 w-full rounded-2xl border border-[#efd1cb] bg-white/82 px-4 py-3 text-sm font-bold text-[#503237] outline-none transition placeholder:text-[#b89b9b] focus:border-[#d85f65] focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a16d72]">Mood de hoy</span>
              <select
                value={draft.mood}
                onChange={(event) => updateDraft({ mood: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-[#efd1cb] bg-white/82 px-4 py-3 text-sm font-bold text-[#503237] outline-none transition focus:border-[#d85f65] focus:bg-white"
              >
                {moods.map((mood) => (
                  <option key={mood} value={mood}>{mood}</option>
                ))}
              </select>
            </label>
          </div>

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
                    className={`rounded-full border px-3 py-2 text-xs font-extrabold transition ${
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
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a16d72]">Mensaje</span>
            <textarea
              value={draft.message}
              onChange={(event) => updateDraft({ message: event.target.value.slice(0, 170) })}
              maxLength={170}
              rows={5}
              className="mt-2 w-full resize-none rounded-2xl border border-[#efd1cb] bg-white/82 px-4 py-3 text-sm font-semibold leading-6 text-[#503237] outline-none transition placeholder:text-[#b89b9b] focus:border-[#d85f65] focus:bg-white"
            />
            <span className="mt-1 block text-right text-[10px] font-bold text-[#a16d72]">{draft.message.length}/170</span>
          </label>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a16d72]">Firma</span>
              <input
                value={draft.signature}
                onChange={(event) => updateDraft({ signature: event.target.value.slice(0, 28) })}
                maxLength={28}
                className="mt-2 w-full rounded-2xl border border-[#efd1cb] bg-white/82 px-4 py-3 text-sm font-bold text-[#503237] outline-none transition placeholder:text-[#b89b9b] focus:border-[#d85f65] focus:bg-white"
              />
            </label>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a16d72]">Foto</p>
              <label className="mt-2 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border border-[#efd1cb] bg-white/82 px-4 text-sm font-extrabold text-[#68484c] transition hover:bg-white">
                Elegir foto
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => choosePhoto(event.target.files?.[0])}
                />
              </label>
            </div>
          </div>

          {photoName && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white bg-white/70 px-4 py-3">
              <p className="min-w-0 truncate text-xs font-bold text-[#76585c]">{photoName}</p>
              <button type="button" onClick={() => choosePhoto()} className="shrink-0 rounded-full bg-[#f2ddd8] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#9e525b]">
                Sacar
              </button>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <PostcardPreview draft={draft} preset={preset} photoUrl={photoUrl} />

          <div className="rounded-[1.75rem] border border-white bg-white/72 p-4 shadow-sm">
            <div className="grid gap-2">
              <button
                type="button"
                onClick={generated ? shareImage : createImage}
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d85f65] px-5 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(216,95,101,0.25)] transition hover:-translate-y-0.5 hover:bg-[#c64f58] disabled:translate-y-0 disabled:cursor-wait disabled:opacity-70"
              >
                {generated ? <HeartIcon className="h-4 w-4" /> : <SparkleIcon className="h-4 w-4" />}
                {busy ? "Preparando..." : generated ? "Compartir JPG" : "Generar JPG"}
              </button>

              {generated && (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  <button
                    type="button"
                    onClick={downloadImage}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#efd1cb] bg-white px-5 py-3 text-sm font-black text-[#68484c] transition hover:bg-[#fff7f2]"
                  >
                    <CheckIcon className="h-4 w-4" />
                    Descargar
                  </button>
                  <button
                    type="button"
                    onClick={() => openWhatsApp(buildShareText())}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#efd1cb] bg-white px-5 py-3 text-sm font-black text-[#68484c] transition hover:bg-[#fff7f2]"
                  >
                    <HeartIcon className="h-4 w-4" />
                    WhatsApp
                  </button>
                </div>
              )}
            </div>

            {status && (
              <p className="mt-3 rounded-2xl bg-[#fff5ef] px-4 py-3 text-center text-xs font-bold leading-5 text-[#8a6266]">{status}</p>
            )}
          </div>

          {generated && (
            <div className="rounded-[1.75rem] border border-white bg-white/72 p-3 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={generated.url} alt="Postal generada en JPG" className="w-full rounded-[1.25rem] shadow-sm" />
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
