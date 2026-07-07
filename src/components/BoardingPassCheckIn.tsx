"use client";

import { useEffect, useMemo, useState } from "react";
import type { BoardingPassConfig } from "@/data/days";
import { CheckIcon, HeartIcon, SparkleIcon } from "./icons";

interface BoardingPassCheckInProps {
  config?: BoardingPassConfig;
  day: number;
}

interface DestinationOption {
  id: string;
  label: string;
  code: string;
  description: string;
}

interface BaggageOption {
  id: string;
  label: string;
  description: string;
}

interface CheckInDraft {
  destinationId: string;
  baggageIds: string[];
  longing: number;
}

type StepIndex = 0 | 1 | 2 | 3;

const defaultConfig: BoardingPassConfig = {
  passenger: "Danu",
  flight: "DNU-011",
  route: "DNU -> BNY",
  gate: "Abrazo",
  seat: "1A",
  intro: "Ya pasamos la mitad invisible: desde ahora cada día no te aleja del viaje, te acerca al reencuentro.",
  finalMessage: "Check-in completo. A partir de hoy, cada día no se siente como que te fuiste: se siente como que estás volviendo. Seguí juntando historias, fotos y risas. Yo te espero en la puerta de embarque más importante: la del abrazo.",
};

const destinations: DestinationOption[] = [
  {
    id: "arms",
    label: "Brazos de Benyu",
    code: "BNY",
    description: "Destino directo, sin escalas y con embarque prioritario.",
  },
  {
    id: "hug",
    label: "Abrazo infinito",
    code: "ABZ",
    description: "Para llegar, quedarse y no apurarse en soltar.",
  },
  {
    id: "home",
    label: "Casa + historias",
    code: "HST",
    description: "Modo volver, contar todo y revivir el viaje juntos.",
  },
  {
    id: "all",
    label: "Todas las anteriores",
    code: "ALL",
    description: "La opción correcta cuando el corazón no quiere elegir.",
  },
];

const baggageOptions: BaggageOption[] = [
  {
    id: "stories",
    label: "Historias para contarme",
    description: "Todo lo que no entra en una foto.",
  },
  {
    id: "photos",
    label: "Fotos nuevas",
    description: "Pruebas oficiales de que la estás rompiendo.",
  },
  {
    id: "hugs",
    label: "Abrazos acumulados",
    description: "Se despachan, pero se retiran en persona.",
  },
  {
    id: "sleep",
    label: "Un poquito de sueño",
    description: "Permitido. El jet lag emocional existe.",
  },
  {
    id: "miss",
    label: "Ganas de verme",
    description: "Equipaje frágil y muy importante.",
  },
  {
    id: "love",
    label: "Mucho amorcito",
    description: "Exceso autorizado por Benyu Airlines.",
  },
];

const stepLabels = ["Destino", "Equipaje", "Extrañitis", "Ticket"] as const;
const barcodeBars = [7, 3, 10, 5, 3, 12, 4, 8, 3, 5, 11, 3, 7, 4, 13, 5, 3, 9, 4, 7, 11, 3, 5, 8, 4, 12];

function getDefaultDraft(): CheckInDraft {
  return {
    destinationId: "all",
    baggageIds: ["stories", "hugs", "miss"],
    longing: 78,
  };
}

function sanitizeDraft(value: unknown, fallback: CheckInDraft): CheckInDraft {
  if (!value || typeof value !== "object") return fallback;
  const draft = value as Partial<CheckInDraft>;
  const destinationId = typeof draft.destinationId === "string" && destinations.some((destination) => destination.id === draft.destinationId)
    ? draft.destinationId
    : fallback.destinationId;
  const baggageIds = Array.isArray(draft.baggageIds)
    ? draft.baggageIds.filter((id): id is string => baggageOptions.some((option) => option.id === id)).slice(0, 3)
    : fallback.baggageIds;
  const longing = typeof draft.longing === "number" && Number.isFinite(draft.longing)
    ? Math.min(100, Math.max(0, Math.round(draft.longing)))
    : fallback.longing;

  return {
    destinationId,
    baggageIds: baggageIds.length ? baggageIds : fallback.baggageIds,
    longing,
  };
}

function getLongingLabel(value: number) {
  if (value < 25) return "Te extraño normal";
  if (value < 50) return "Extrañitis controlada";
  if (value < 75) return "Modo cuenta regresiva";
  if (value < 92) return "Benyu vení ya";
  return "Estado oficialmente insoportable";
}

function getLongingColor(value: number) {
  if (value < 50) return "#2c7a7b";
  if (value < 75) return "#b87731";
  return "#d85f65";
}

function normalizeCodePart(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function buildBoardingCode(config: BoardingPassConfig, destination: DestinationOption, longing: number) {
  const flightCode = normalizeCodePart(config.flight) || "DNU011";
  const seatCode = normalizeCodePart(config.seat) || "1A";

  return `${flightCode}-${destination.code}-${seatCode}-${String(longing).padStart(2, "0")}`;
}

function buildCaptainMessage(config: BoardingPassConfig, destination: DestinationOption, boardingCode: string) {
  return `Capitán Benyu, presento mi código de embarque ${boardingCode} para recibir mi carta. Pasajera: ${config.passenger}. Destino emocional: ${destination.label}.`;
}

function StepTabs({ activeStep, onSelect }: { activeStep: StepIndex; onSelect: (step: StepIndex) => void }) {
  return (
    <div className="grid grid-cols-4 gap-1 rounded-2xl bg-white/66 p-1.5">
      {stepLabels.map((label, index) => {
        const selected = activeStep === index;
        return (
          <button
            key={label}
            type="button"
            aria-current={selected ? "step" : undefined}
            onClick={() => onSelect(index as StepIndex)}
            className={`min-h-12 rounded-xl px-1 text-center transition ${
              selected ? "bg-[#1f5d66] text-white shadow-sm" : "text-[#7b6565] hover:bg-white"
            }`}
          >
            <span className="block text-[10px] font-black">{index + 1}</span>
            <span className="block text-[9px] font-black sm:text-[11px]">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function BoardingPass({
  config,
  destination,
  baggage,
  longing,
  issued,
  scanning,
}: {
  config: BoardingPassConfig;
  destination: DestinationOption;
  baggage: BaggageOption[];
  longing: number;
  issued: boolean;
  scanning: boolean;
}) {
  const longingColor = getLongingColor(longing);

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-[#f3d9cb] bg-[#fffdf8] shadow-[0_18px_45px_rgba(48,72,78,0.14)]">
      {scanning && <span className="boarding-scan-line" />}

      <div className="bg-[#1f5d66] px-5 py-4 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#f7d8a9]">Benyu Airlines</p>
            <h4 className="font-display mt-1 text-3xl font-semibold leading-none">Boarding pass</h4>
          </div>
          <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${issued ? "bg-[#d9f0dc] text-[#386343]" : "bg-white/18 text-white"}`}>
            {issued ? "Confirmado" : "Pre-check"}
          </span>
        </div>
      </div>

      <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_170px]">
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a27769]">Pasajera</p>
              <p className="mt-1 text-xl font-black text-[#503237]">{config.passenger}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a27769]">Vuelo</p>
              <p className="mt-1 text-xl font-black text-[#503237]">{config.flight}</p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-dashed border-[#e9c4b8] bg-[#fff8f1] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a27769]">Ruta</p>
                <p className="mt-1 text-3xl font-black text-[#1f5d66]">{config.route}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a27769]">Destino</p>
                <p className="mt-1 text-lg font-black text-[#503237]">{destination.label}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-[#edf7f4] px-3 py-3">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#4f7a75]">Gate</p>
              <p className="mt-1 text-sm font-black text-[#254f54]">{config.gate}</p>
            </div>
            <div className="rounded-2xl bg-[#fff1dc] px-3 py-3">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#9c6932]">Asiento</p>
              <p className="mt-1 text-sm font-black text-[#6f4a27]">{config.seat}</p>
            </div>
            <div className="rounded-2xl bg-[#fde7e4] px-3 py-3">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#b45a61]">Tramo</p>
              <p className="mt-1 text-sm font-black text-[#8d4149]">2 de 2</p>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-end justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a27769]">Control de extrañitis</p>
              <p className="text-sm font-black" style={{ color: longingColor }}>{longing}%</p>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#ead7cf]">
              <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${longing}%`, backgroundColor: longingColor }} />
            </div>
            <p className="mt-2 text-sm font-black text-[#5f464b]">{getLongingLabel(longing)}</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {baggage.map((item) => (
              <span key={item.id} className="rounded-full border border-[#f1d0c5] bg-white px-3 py-2 text-[11px] font-black text-[#6f565a]">
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative border-t border-dashed border-[#e6c1b5] bg-[#fff8f1] p-5 md:border-l md:border-t-0">
          <span className="absolute -left-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 rounded-full bg-[#fffaf6] md:block" />
          <span className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 rounded-full bg-[#fffaf6] md:block" />

          <div className="grid grid-cols-[1fr_auto] gap-4 md:block">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a27769]">Código</p>
              <p className="mt-1 text-4xl font-black text-[#1f5d66]">{destination.code}</p>
              <p className="mt-2 text-xs font-bold leading-5 text-[#85666b]">Destino emocional aprobado por Benyu.</p>
            </div>

            <div className="mt-0 flex h-24 items-end justify-center gap-[3px] md:mt-8 md:h-36">
              {barcodeBars.map((bar, index) => (
                <span key={`${bar}-${index}`} className="block bg-[#263f43]" style={{ width: `${bar % 4 + 2}px`, height: `${30 + bar * 6}px` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BoardingPassCheckIn({ config: configProp, day }: BoardingPassCheckInProps) {
  const config = configProp ?? defaultConfig;
  const storageKey = useMemo(() => `day-${day}-boarding-pass`, [day]);
  const defaultDraft = useMemo(() => getDefaultDraft(), []);
  const [draft, setDraft] = useState<CheckInDraft>(defaultDraft);
  const [activeStep, setActiveStep] = useState<StepIndex>(0);
  const [ready, setReady] = useState(false);
  const [issued, setIssued] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [captainStatus, setCaptainStatus] = useState("");

  const destination = destinations.find((item) => item.id === draft.destinationId) ?? destinations[0];
  const baggage = draft.baggageIds
    .map((id) => baggageOptions.find((item) => item.id === id))
    .filter((item): item is BaggageOption => Boolean(item));
  const canContinue = activeStep !== 1 || draft.baggageIds.length === 3;
  const boardingCode = buildBoardingCode(config, destination, draft.longing);
  const captainMessage = buildCaptainMessage(config, destination, boardingCode);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
        if (saved && typeof saved === "object") {
          const stored = saved as { draft?: unknown; issued?: unknown };
          setDraft(sanitizeDraft(stored.draft, defaultDraft));
          setIssued(Boolean(stored.issued));
        }
      } catch {
        setDraft(defaultDraft);
      }
      setReady(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [defaultDraft, storageKey]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(storageKey, JSON.stringify({ draft, issued }));
  }, [draft, issued, ready, storageKey]);

  const updateDraft = (patch: Partial<CheckInDraft>) => {
    setCaptainStatus("");
    setIssued(false);
    setDraft((current) => ({ ...current, ...patch }));
  };

  const toggleBaggage = (id: string) => {
    setCaptainStatus("");
    setIssued(false);
    setDraft((current) => {
      if (current.baggageIds.includes(id)) {
        return { ...current, baggageIds: current.baggageIds.filter((item) => item !== id) };
      }
      if (current.baggageIds.length >= 3) return current;
      return { ...current, baggageIds: [...current.baggageIds, id] };
    });
  };

  const goToStep = (step: StepIndex) => setActiveStep(step);
  const goNext = () => activeStep < 3 && canContinue && setActiveStep((activeStep + 1) as StepIndex);
  const goBack = () => activeStep > 0 && setActiveStep((activeStep - 1) as StepIndex);

  const confirmCheckIn = () => {
    if (scanning) return;
    setCaptainStatus("");
    setScanning(true);
    window.setTimeout(() => {
      setScanning(false);
      setIssued(true);
    }, 1150);
  };

  const copyCaptainCode = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(boardingCode);
      setCaptainStatus("Código copiado. Ahora entregáselo al capitán para reclamar tu carta.");
    } catch {
      setCaptainStatus("No pude copiarlo automático, pero podés mantener apretado el código y copiarlo.");
    }
  };

  const sendCaptainCode = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(captainMessage)}`, "_blank", "noopener,noreferrer");
    setCaptainStatus("WhatsApp abierto. Mandale ese código al capitán y pedí tu carta.");
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white bg-gradient-to-br from-[#fffdf9] via-[#fff4ee] to-[#e4f2f0] p-3 shadow-[0_18px_55px_rgba(47,72,78,0.12)] sm:p-5">
      <div className="rounded-[1.75rem] border border-white/85 bg-white/70 p-4 shadow-sm backdrop-blur-sm sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1f5d66] text-white shadow-[0_9px_22px_rgba(31,93,102,0.24)]">
            <HeartIcon className="heartbeat h-6 w-6" />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#1f5d66]">Benyu Airlines</p>
            <h3 className="font-display mt-1 text-3xl font-semibold leading-none text-[#503237] sm:text-4xl">Check-in al reencuentro</h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#76585c]">{config.intro}</p>
          </div>
        </div>

        <div className="mt-5">
          <StepTabs activeStep={activeStep} onSelect={goToStep} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
        <div className="space-y-4">
          {activeStep === 0 && (
            <div className="rounded-[1.75rem] border border-white bg-white/70 p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a27769]">Seleccioná destino</p>
              <h4 className="font-display mt-2 text-3xl font-semibold leading-none text-[#503237]">¿A dónde va este tramo?</h4>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {destinations.map((item) => {
                  const selected = draft.destinationId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => updateDraft({ destinationId: item.id })}
                      className={`min-h-32 rounded-[1.35rem] border p-4 text-left transition active:scale-[0.99] ${
                        selected ? "border-[#1f5d66] bg-[#eef9f6] shadow-sm" : "border-white bg-white/82 hover:bg-white"
                      }`}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span>
                          <span className="block text-lg font-black text-[#503237]">{item.label}</span>
                          <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.2em] text-[#1f5d66]">Destino {item.code}</span>
                        </span>
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${selected ? "border-[#1f5d66] bg-[#1f5d66] text-white" : "border-[#dec5bd] text-transparent"}`}>
                          <CheckIcon className="h-4 w-4" />
                        </span>
                      </span>
                      <span className="mt-3 block text-sm font-semibold leading-6 text-[#806669]">{item.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeStep === 1 && (
            <div className="rounded-[1.75rem] border border-white bg-white/70 p-4 shadow-sm">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a27769]">Equipaje declarado</p>
                  <h4 className="font-display mt-2 text-3xl font-semibold leading-none text-[#503237]">Elegí 3 cosas</h4>
                </div>
                <span className="rounded-full bg-[#fff1dc] px-3 py-1 text-xs font-black text-[#8c5a2b]">{draft.baggageIds.length}/3</span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {baggageOptions.map((item) => {
                  const selected = draft.baggageIds.includes(item.id);
                  const disabled = !selected && draft.baggageIds.length >= 3;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={selected}
                      disabled={disabled}
                      onClick={() => toggleBaggage(item.id)}
                      className={`min-h-28 rounded-[1.35rem] border p-4 text-left transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 ${
                        selected ? "border-[#d85f65] bg-[#fff0ee] shadow-sm" : "border-white bg-white/82 hover:bg-white"
                      }`}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="text-base font-black text-[#503237]">{item.label}</span>
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${selected ? "border-[#d85f65] bg-[#d85f65] text-white" : "border-[#dec5bd] text-transparent"}`}>
                          <CheckIcon className="h-4 w-4" />
                        </span>
                      </span>
                      <span className="mt-2 block text-sm font-semibold leading-6 text-[#806669]">{item.description}</span>
                    </button>
                  );
                })}
              </div>

              {!canContinue && (
                <p className="mt-4 rounded-2xl bg-[#fff8f1] px-4 py-3 text-center text-xs font-black text-[#8c5a2b]">Benyu Airlines necesita exactamente 3 equipajes emocionales.</p>
              )}
            </div>
          )}

          {activeStep === 2 && (
            <div className="rounded-[1.75rem] border border-white bg-white/70 p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a27769]">Control de extrañitis</p>
              <h4 className="font-display mt-2 text-3xl font-semibold leading-none text-[#503237]">Medidor oficial</h4>

              <div className="mt-6 rounded-[1.5rem] border border-white bg-white/82 p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a27769]">Nivel actual</p>
                    <p className="mt-2 text-2xl font-black text-[#503237]">{getLongingLabel(draft.longing)}</p>
                  </div>
                  <span className="font-display text-5xl font-semibold leading-none" style={{ color: getLongingColor(draft.longing) }}>{draft.longing}</span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={draft.longing}
                  onChange={(event) => updateDraft({ longing: Number(event.target.value) })}
                  className="mt-6 w-full"
                  style={{ accentColor: getLongingColor(draft.longing) }}
                />

                <div className="mt-2 flex justify-between text-[10px] font-black uppercase tracking-[0.12em] text-[#9b7b7e]">
                  <span>Tranqui</span>
                  <span>Vení ya</span>
                </div>
              </div>

              <p className="mt-4 rounded-2xl bg-[#edf7f4] px-4 py-3 text-sm font-bold leading-6 text-[#315d61]">
                Resultado del escaneo: falta menos de lo que ya pasó. El sistema recomienda seguir disfrutando, pero preparar abrazo.
              </p>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4">
              <BoardingPass config={config} destination={destination} baggage={baggage} longing={draft.longing} issued={issued} scanning={scanning} />

              {issued ? (
                <div className="rounded-[1.75rem] border border-[#b8d8cc] bg-[#eef9f6] p-5 text-center shadow-sm">
                  <SparkleIcon className="sparkle mx-auto h-6 w-6 text-[#1f5d66]" />
                  <h4 className="font-display mt-3 text-4xl font-semibold leading-none text-[#1f5d66]">Check-in completo</h4>
                  <p className="mt-4 text-sm font-bold leading-6 text-[#4f6665]">{config.finalMessage}</p>

                  <div className="mt-5 border-y border-[#b8d8cc] py-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#1f5d66]">Entrega final</p>
                    <h5 className="font-display mt-2 text-3xl font-semibold leading-none text-[#503237]">Presentá tu código al capitán</h5>
                    <p className="mx-auto mt-3 max-w-xl text-sm font-bold leading-6 text-[#4f6665]">
                      Para recibir tu carta, entregale este código de embarque al capitán Benyu. Sin este pase, la tripulación no libera correspondencia secreta.
                    </p>
                    <p className="mt-4 break-all rounded-2xl bg-white px-4 py-4 font-mono text-2xl font-black tracking-[0.12em] text-[#d85f65] shadow-sm sm:text-4xl">
                      {boardingCode}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={copyCaptainCode}
                      className="min-h-12 rounded-2xl border border-[#b8d8cc] bg-white px-5 text-sm font-black text-[#1f5d66] transition hover:-translate-y-0.5 hover:bg-[#f7fffc]"
                    >
                      Copiar código
                    </button>
                    <button
                      type="button"
                      onClick={sendCaptainCode}
                      className="min-h-12 rounded-2xl bg-[#1f5d66] px-5 text-sm font-black text-white shadow-[0_10px_24px_rgba(31,93,102,0.22)] transition hover:-translate-y-0.5 hover:bg-[#174d55]"
                    >
                      Mandárselo al capitán
                    </button>
                  </div>

                  {captainStatus && (
                    <p className="mt-3 text-xs font-black leading-5 text-[#4f6665]" aria-live="polite">
                      {captainStatus}
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-[1.75rem] border border-[#f1d0c5] bg-white/78 p-5 text-center shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a27769]">Último control</p>
                  <h4 className="font-display mt-2 text-3xl font-semibold leading-none text-[#503237]">Tu ticket está listo</h4>
                  <p className="mt-3 text-sm font-bold leading-6 text-[#76585c]">Confirmá el check-in para activar oficialmente el segundo tramo hacia el reencuentro.</p>
                  <button
                    type="button"
                    onClick={confirmCheckIn}
                    disabled={scanning}
                    className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#d85f65] px-5 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(216,95,101,0.28)] transition hover:-translate-y-0.5 hover:bg-[#c64f58] disabled:cursor-wait disabled:opacity-75"
                  >
                    <SparkleIcon className="h-4 w-4" />
                    {scanning ? "Escaneando ticket..." : "Confirmar check-in"}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="sticky bottom-0 z-10 -mx-3 mt-3 border-t border-white/70 bg-[#fffaf6]/90 px-3 py-3 backdrop-blur-md sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:border-t-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-0">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
              <button
                type="button"
                onClick={goBack}
                disabled={activeStep === 0 || scanning}
                className="min-h-12 rounded-2xl border border-[#efd1cb] bg-white/86 px-4 text-sm font-black text-[#68484c] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                Atrás
              </button>
              {activeStep < 3 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canContinue || scanning}
                  className="min-h-12 rounded-2xl bg-[#1f5d66] px-5 text-sm font-black text-white shadow-[0_10px_24px_rgba(31,93,102,0.22)] transition hover:-translate-y-0.5 hover:bg-[#174d55] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={issued ? () => setActiveStep(0) : confirmCheckIn}
                  disabled={scanning}
                  className="min-h-12 rounded-2xl bg-[#d85f65] px-5 text-sm font-black text-white shadow-[0_10px_24px_rgba(216,95,101,0.25)] transition hover:-translate-y-0.5 hover:bg-[#c64f58] disabled:cursor-wait disabled:opacity-70"
                >
                  {issued ? "Editar ticket" : scanning ? "Escaneando..." : "Confirmar check-in"}
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-4 space-y-4">
            <BoardingPass config={config} destination={destination} baggage={baggage} longing={draft.longing} issued={issued} scanning={scanning} />
            <div className="rounded-[1.5rem] border border-white bg-white/66 p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1f5d66]">Estado del tramo</p>
              <p className="mt-2 text-sm font-bold leading-6 text-[#76585c]">
                {issued ? "Ticket confirmado. El sistema ya considera que Danu está volviendo." : "Completá los pasos y confirmá el check-in para activar el boarding pass."}
              </p>
              {issued && (
                <p className="mt-3 rounded-2xl bg-[#eef9f6] px-3 py-2 font-mono text-sm font-black tracking-[0.08em] text-[#1f5d66]">
                  {boardingCode}
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
