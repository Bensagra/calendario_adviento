import { REUNION_DATE } from "@/data/config";
import { HeartIcon } from "./icons";

function getDaysLeft() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reunion = new Date(`${REUNION_DATE}T00:00:00`);
  return Math.max(0, Math.ceil((reunion.getTime() - today.getTime()) / 86_400_000));
}

export function CountdownHeader() {
  const daysLeft = getDaysLeft();
  const message = daysLeft === 0
    ? "Hoy nos volvemos a ver ❤️"
    : `Faltan ${daysLeft} ${daysLeft === 1 ? "día" : "días"} para volver a vernos`;

  return (
    <header className="mx-auto max-w-3xl text-center">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/55 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#a94a53] shadow-sm backdrop-blur-xl">
        <HeartIcon className="h-3.5 w-3.5" />
        Una sorpresa por día
      </div>
      <h1 className="font-display text-[3.4rem] font-semibold leading-[0.9] tracking-[-0.045em] text-[#4d2d32] sm:text-7xl">
        20 días para
        <span className="block italic text-[#bf4c56]">volver a verte</span>
      </h1>
      <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-[#81686b] sm:text-base">
        Un calendario hecho con amor, un día a la vez.
      </p>
      <div className="glass-card mx-auto mt-7 flex max-w-sm items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold text-[#68464b]">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d85f65] text-white shadow-[0_5px_15px_rgba(216,95,101,0.32)]">
          <HeartIcon className="h-4 w-4" />
        </span>
        {message}
      </div>
    </header>
  );
}
