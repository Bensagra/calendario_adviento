"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { CalendarDay } from "@/data/days";
import { getYouTubeEmbedUrl } from "@/data/contentUrls";
import { CouponCard } from "./CouponCard";
import { HeartIcon } from "./icons";

function MissingContent() {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-[#d8aeaa] bg-[#fff9f4] p-8 text-center">
      <HeartIcon className="h-7 w-7 text-[#d07a7e]" />
      <p className="mt-4 font-semibold text-[#64484b]">Todavía falta cargar esta sorpresa.</p>
      <p className="mt-1 text-xs text-[#9a7e80]">Va a aparecer acá apenas esté lista.</p>
    </div>
  );
}

function AuxiliaryText({ text, floating = false }: { text?: string; floating?: boolean }) {
  if (!text) return null;

  return (
    <p className={floating
      ? "pointer-events-none absolute inset-x-4 bottom-5 rounded-2xl bg-black/52 px-4 py-3 text-center text-sm font-semibold leading-6 text-white backdrop-blur-md sm:inset-x-8"
      : "mt-4 rounded-2xl bg-[#fff5ef] px-5 py-4 text-center text-sm font-semibold leading-6 text-[#76585c]"
    }>
      {text}
    </p>
  );
}

export function ContentRenderer({ item, contentUrl }: { item: CalendarDay; contentUrl?: string }) {
  const [hasError, setHasError] = useState(false);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const source = contentUrl?.trim() || item.file;

  useLayoutEffect(() => {
    if (item.type !== "video") return;

    void videoRef.current?.play().catch(() => {
      // Some browsers still block autoplay even after the user opened the day.
    });

    const fullscreenElement = fullscreenRef.current;
    if (fullscreenElement && !document.fullscreenElement) {
      void fullscreenElement.requestFullscreen().catch(() => {
        // Fullscreen requires user activation and may be disabled by the browser.
      });
    }
  }, [item.type, source]);

  if (item.type === "coupon") return <CouponCard text={item.text ?? ""} />;

  if (item.type === "text") {
    return (
      <div className="rounded-[2rem] border border-white bg-gradient-to-br from-white/90 to-[#fff3eb] p-7 shadow-[0_16px_45px_rgba(103,54,59,0.08)] sm:p-10">
        <p className="font-display whitespace-pre-line text-center text-2xl font-medium leading-relaxed text-[#5a3b3f] sm:text-3xl">{item.text}</p>
        <HeartIcon className="mx-auto mt-7 h-5 w-5 text-[#ce646b]" />
      </div>
    );
  }

  if (!source || hasError) return <MissingContent />;

  if (item.type === "image") {
    return (
      <div>
        {/* Native img lets us gracefully catch missing user-provided files. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={source} alt={item.title} onError={() => setHasError(true)} className="max-h-[65vh] w-full rounded-[1.75rem] object-contain shadow-lg" />
        <AuxiliaryText text={item.text} />
      </div>
    );
  }

  if (item.type === "audio") {
    return (
      <div className="rounded-[1.75rem] bg-gradient-to-br from-[#ffece7] to-white p-6 text-center sm:p-9">
        <HeartIcon className="mx-auto h-8 w-8 text-[#cc5c64]" />
        <p className="mt-4 text-sm font-semibold text-[#68484c]">Escuchalo cuando tengas un ratito para vos</p>
        <audio controls src={source} onError={() => setHasError(true)} className="mt-6 w-full" />
        <AuxiliaryText text={item.text} />
      </div>
    );
  }

  const youtubeEmbedUrl = getYouTubeEmbedUrl(source);

  if (youtubeEmbedUrl) {
    return (
      <div ref={fullscreenRef} className="relative h-full w-full overflow-hidden bg-black">
        <iframe
          src={youtubeEmbedUrl}
          title={item.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full border-0"
        />
        <AuxiliaryText text={item.text} floating />
      </div>
    );
  }

  return (
    <div ref={fullscreenRef} className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        controls
        src={source}
        onError={() => setHasError(true)}
        className="h-full w-full object-contain"
      />
      <AuxiliaryText text={item.text} floating />
    </div>
  );
}
