import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Waveform } from "./Waveform";
import { AlertScreen } from "./AlertScreen";
import type { Alert, Status } from "./types";
import { telemetry, type TelemetryFrame } from "@/lib/telemetry";
import { fetchTrackWeather, type TrackWeather } from "@/lib/trackWeather";

// Auto-pause when ETA crosses into the pit window (≤ this many seconds).
const PIT_WINDOW_THRESHOLD_S = 10;

const STATUS_CYCLE: Status[] = ["CLEAR", "READY", "DEPLOYING"];

const STATUS_STYLE: Record<Status, string> = {
  READY:
    "bg-pit-green/15 border-pit-green text-pit-green shadow-[0_0_25px_-5px_rgba(0,255,136,0.6)]",
  DEPLOYING:
    "bg-pit-orange/15 border-pit-orange text-pit-orange pulse-orange",
  CLEAR: "bg-pit-surface border-pit-border text-pit-muted",
};

const STATUS_HINT: Record<Status, string> = {
  CLEAR: "Crew stand-by · pit lane open",
  READY: "Tools armed · gantry green",
  DEPLOYING: "Crew over the wall — GO",
};

type CommMsg = { id: number; from: "ME" | "ENG"; text: string; ts: number };

const COMM_ACTIONS: { label: string; text: string; color: string }[] = [
  { label: "COPY",      text: "Copy that.",                       color: "text-pit-text border-pit-border" },
  { label: "CONFIRM",   text: "Confirmed — ready on your call.",  color: "text-pit-green border-pit-green/60" },
  { label: "NEGATIVE",  text: "Negative — abort, abort.",         color: "text-pit-orange border-pit-orange/60" },
  { label: "EMERGENCY", text: "EMERGENCY — STOP CAR NOW.",        color: "text-pit-red border-pit-red/60 pulse-red" },
];

const ENG_LINES = [
  "Box this lap, box this lap.",
  "Target lap −0.4, push now.",
  "DRS available, gap 1.1s.",
  "Watch tyres turn 7, dropping.",
];

function fmtClock(ts: number) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}:${d.getSeconds().toString().padStart(2,"0")}`;
}

export function Dashboard() {
  const [status, setStatus] = useState<Status>("CLEAR");
  const [frame, setFrame] = useState<TelemetryFrame>(() => telemetry.getSnapshot());
  const [paused, setPaused] = useState(false);
  const [engineerSpeaking, setEngineerSpeaking] = useState(false);
  const [arSync, setArSync] = useState(true);
  const [driverCam, setDriverCam] = useState(false);
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  const [comms, setComms] = useState<CommMsg[]>([]);
  const [weather, setWeather] = useState<TrackWeather | null>(null);
  const [weatherErr, setWeatherErr] = useState(false);

  // Telemetry stream
  useEffect(() => telemetry.subscribe(setFrame), []);
  useEffect(() => telemetry.onPauseChange(setPaused), []);

  // Real weather (Open-Meteo, no key) — refresh every 5 min.
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetchTrackWeather()
        .then((w) => { if (!cancelled) { setWeather(w); setWeatherErr(false); } })
        .catch(() => { if (!cancelled) setWeatherErr(true); });
    load();
    const t = setInterval(load, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  // Auto-pause crossing into pit window
  const armedRef = useRef(true);
  useEffect(() => {
    if (frame.etaSeconds > PIT_WINDOW_THRESHOLD_S) { armedRef.current = true; return; }
    if (armedRef.current && !paused) {
      armedRef.current = false;
      telemetry.pause();
    }
  }, [frame.etaSeconds, paused]);

  // Engineer chatter — pushes a real message into the comms log
  useEffect(() => {
    const t = setInterval(() => {
      setEngineerSpeaking(true);
      const text = ENG_LINES[Math.floor(Math.random() * ENG_LINES.length)];
      setComms((c) => [{ id: Date.now(), from: "ENG" as const, text, ts: Date.now() }, ...c].slice(0, 6));
      setTimeout(() => setEngineerSpeaking(false), 1800);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  // Auto-trigger real alerts from live telemetry (no random demo fluff)
  useEffect(() => {
    if (activeAlert) return;
    if (frame.brakeTempC > 880) {
      setActiveAlert({ id: "brakes", system: "Brake Temp", label: "Overheating", value: `${frame.brakeTempC}°C` });
    } else if (frame.tyrePsiRR < 19) {
      setActiveAlert({ id: "tyre", system: "Tyre PSI :: RR", label: "Critical Low", value: `${frame.tyrePsiRR} psi` });
    } else if (frame.tyreTempC > 128) {
      setActiveAlert({ id: "tyre-hot", system: "Tyre Temp", label: "Overheating", value: `${frame.tyreTempC}°C` });
    }
  }, [frame, activeAlert]);

  // Watch-face glow
  useEffect(() => {
    const glow = activeAlert ? "red" : status === "READY" ? "green" : "neutral";
    window.dispatchEvent(new CustomEvent("pit-glow", { detail: glow }));
  }, [status, activeAlert]);

  const etaStr = useMemo(() => {
    const total = Math.max(0, Math.ceil(frame.etaSeconds));
    return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`;
  }, [frame.etaSeconds]);

  const cycleStatus = () => {
    const i = STATUS_CYCLE.indexOf(status);
    setStatus(STATUS_CYCLE[(i + 1) % STATUS_CYCLE.length]);
  };

  const sendComm = (label: string, text: string) => {
    setComms((c) => [{ id: Date.now(), from: "ME" as const, text: `[${label}] ${text}`, ts: Date.now() }, ...c].slice(0, 6));
    if (label === "EMERGENCY") {
      setActiveAlert({ id: "manual-emg", system: "Crew Channel", label: "Emergency Sent", value: "STOP CAR" });
    }
  };

  const stressColor = frame.stress > 80 ? "text-pit-red" : frame.stress > 60 ? "text-pit-orange" : "text-pit-green";
  const hrColor     = frame.hr > 150 ? "text-pit-red" : frame.hr > 130 ? "text-pit-orange" : "text-pit-green";
  const brakeColor  = frame.brakeTempC > 800 ? "text-pit-red" : frame.brakeTempC > 650 ? "text-pit-orange" : "text-pit-green";
  const tyreColor   = frame.tyreTempC > 120 ? "text-pit-red" : frame.tyreTempC > 110 ? "text-pit-orange" : "text-pit-green";

  return (
    <AnimatePresence mode="wait">
      {activeAlert ? (
        <AlertScreen key="alert-view" alert={activeAlert} onAck={() => setActiveAlert(null)} />
      ) : (
        <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col gap-3">
          {/* Top status bar */}
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-pit-muted">
            <span className="text-pit-green">● LIVE</span>
            <span>LAP {frame.lap} / {frame.totalLaps}</span>
            <span className={arSync ? "text-pit-green" : "text-pit-muted"}>
              ◇ AR {arSync ? "SYNC" : "OFF"}
            </span>
          </div>

          {/* Real track weather strip */}
          <div className="flex items-center justify-between rounded-xl border border-pit-border bg-pit-surface/40 px-3 py-1.5 text-[10px] uppercase tracking-widest">
            <span className="text-pit-muted">{weather?.venue ?? "MONZA"} · LIVE WX</span>
            {weather ? (
              <span className="flex items-center gap-2 tabular-nums">
                <span className="text-pit-text">AIR {weather.airTempC}°</span>
                <span className={weather.trackTempC > 45 ? "text-pit-orange" : "text-pit-green"}>
                  TRK {weather.trackTempC}°
                </span>
                <span className="text-pit-muted">{weather.windKph}km/h</span>
                <span className={weather.rainMmH > 0 ? "text-pit-yellow blink" : "text-pit-muted"}>
                  {weather.rainMmH > 0 ? `RAIN ${weather.rainMmH}mm` : "DRY"}
                </span>
              </span>
            ) : (
              <span className="text-pit-muted">{weatherErr ? "OFFLINE" : "SYNC…"}</span>
            )}
          </div>

          {/* Pit window timer */}
          <div className="relative rounded-2xl border border-pit-border bg-pit-surface/60 px-4 py-3 text-center">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-pit-muted">
              <span>Pit Window · ETA</span>
              <span className={paused ? "text-pit-orange blink" : "text-pit-green"}>
                {paused ? "■ PAUSED" : "▶ LIVE"}
              </span>
            </div>
            <div className={`mt-1 text-4xl font-bold tabular-nums ${paused ? "text-pit-orange" : "text-pit-green"}`}>
              {etaStr}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-pit-muted">
              {paused
                ? "Auto-paused · car in box"
                : frame.etaSeconds <= PIT_WINDOW_THRESHOLD_S
                  ? `Pit window ≤ ${PIT_WINDOW_THRESHOLD_S}s`
                  : "Car #44 inbound"}
            </div>
          </div>

          {/* Stream controls */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => telemetry.toggle()}
              className={`rounded-xl border-2 py-3 text-xs font-bold uppercase tracking-widest active:scale-95 ${
                paused
                  ? "border-pit-green text-pit-green bg-pit-green/10"
                  : "border-pit-orange text-pit-orange bg-pit-orange/10"
              }`}
            >
              {paused ? "▶ Resume Stream" : "■ Pause Stream"}
            </button>
            <button
              onClick={() => telemetry.resume()}
              disabled={!paused}
              className={`rounded-xl border-2 py-3 text-xs font-bold uppercase tracking-widest active:scale-95 disabled:opacity-30 ${
                paused
                  ? "border-pit-green text-pit-green bg-pit-green/10 pulse-orange"
                  : "border-pit-border bg-pit-bg/40 text-pit-muted"
              }`}
            >
              ⟳ Re-sync
            </button>
          </div>

          {/* Status toggle */}
          <button
            onClick={cycleStatus}
            className={`rounded-2xl border-2 py-4 text-center transition-all active:scale-[0.98] ${STATUS_STYLE[status]}`}
          >
            <div className="text-lg font-bold uppercase tracking-[0.25em]">{status}</div>
            <div className="text-[9px] uppercase tracking-widest opacity-80">{STATUS_HINT[status]}</div>
          </button>

          {/* Car telemetry — real-time */}
          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-xl border border-pit-border bg-pit-surface/60 px-2 py-2 text-center">
              <div className="text-[8px] uppercase tracking-widest text-pit-muted">SPD</div>
              <div className="text-base font-bold tabular-nums text-pit-text">{frame.speedKph}</div>
              <div className="text-[8px] text-pit-muted">km/h</div>
            </div>
            <div className="rounded-xl border border-pit-border bg-pit-surface/60 px-2 py-2 text-center">
              <div className="text-[8px] uppercase tracking-widest text-pit-muted">GEAR</div>
              <div className="text-base font-bold tabular-nums text-pit-yellow">{frame.gear}</div>
              <div className="text-[8px] text-pit-muted">N{frame.gear}</div>
            </div>
            <div className="rounded-xl border border-pit-border bg-pit-surface/60 px-2 py-2 text-center">
              <div className="text-[8px] uppercase tracking-widest text-pit-muted">BRK</div>
              <div className={`text-base font-bold tabular-nums ${brakeColor}`}>{frame.brakeTempC}</div>
              <div className="text-[8px] text-pit-muted">°C</div>
            </div>
            <div className="rounded-xl border border-pit-border bg-pit-surface/60 px-2 py-2 text-center">
              <div className="text-[8px] uppercase tracking-widest text-pit-muted">TYR</div>
              <div className={`text-base font-bold tabular-nums ${tyreColor}`}>{frame.tyreTempC}</div>
              <div className="text-[8px] text-pit-muted">°C · {frame.tyrePsiRR}psi</div>
            </div>
          </div>

          {/* Crew biometrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-pit-border bg-pit-surface/60 px-2 py-2">
              <div className="text-[9px] uppercase tracking-widest text-pit-muted">HR</div>
              <div className={`text-lg font-bold tabular-nums ${hrColor}`}>{frame.hr}<span className="ml-1 text-[9px] text-pit-muted">BPM</span></div>
            </div>
            <div className="rounded-xl border border-pit-border bg-pit-surface/60 px-2 py-2">
              <div className="text-[9px] uppercase tracking-widest text-pit-muted">Stress</div>
              <div className={`text-lg font-bold tabular-nums ${stressColor}`}>{frame.stress}<span className="ml-1 text-[9px] text-pit-muted">%</span></div>
            </div>
            <div className="rounded-xl border border-pit-border bg-pit-surface/60 px-2 py-2">
              <div className="text-[9px] uppercase tracking-widest text-pit-muted">Fuel</div>
              <div className="text-lg font-bold tabular-nums text-pit-text">{frame.fuelKg}<span className="ml-1 text-[9px] text-pit-muted">kg</span></div>
            </div>
          </div>

          {/* Engineer comms */}
          <div className="rounded-2xl border border-pit-border bg-pit-surface/60 px-3 py-2">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
              <span className="text-pit-muted">Race Engineer</span>
              <span className={engineerSpeaking ? "text-pit-green" : "text-pit-muted"}>
                {engineerSpeaking ? "● TX" : "○ IDLE"}
              </span>
            </div>
            <Waveform active={engineerSpeaking} />
            {/* Live comm log — practical: see what was just sent/received */}
            <div className="mt-2 max-h-24 space-y-1 overflow-y-auto text-[10px] font-mono">
              {comms.length === 0 ? (
                <div className="text-pit-muted">— channel quiet —</div>
              ) : comms.map((m) => (
                <div key={m.id} className="flex gap-2">
                  <span className="text-pit-muted tabular-nums">{fmtClock(m.ts)}</span>
                  <span className={m.from === "ME" ? "text-pit-green" : "text-pit-yellow"}>{m.from}</span>
                  <span className="text-pit-text">{m.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick comm actions — now actually send into the log */}
          <div className="grid grid-cols-2 gap-2">
            {COMM_ACTIONS.map((a) => (
              <button
                key={a.label}
                onClick={() => sendComm(a.label, a.text)}
                className={`rounded-xl border bg-pit-bg/40 py-3 text-xs font-bold uppercase tracking-widest active:scale-95 ${a.color}`}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* AR + Driver cam — real toggles with payload */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setArSync((v) => !v)}
              className={`rounded-xl border px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest ${
                arSync ? "border-pit-green/60 text-pit-green" : "border-pit-border text-pit-muted"
              }`}
            >
              <div>◇ AR HUD {arSync ? "SYNCED" : "OFFLINE"}</div>
              <div className="text-[9px] opacity-70">{arSync ? "Visor overlay live" : "Tap to re-pair visor"}</div>
            </button>
            <button
              onClick={() => setDriverCam((v) => !v)}
              className={`rounded-xl border px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest ${
                driverCam ? "border-pit-yellow text-pit-yellow bg-pit-yellow/10" : "border-pit-yellow/40 text-pit-yellow/70"
              }`}
            >
              <div>▶ Driver Cam {driverCam ? "ON" : "OFF"}</div>
              <div className="text-[9px] opacity-70">{driverCam ? `${frame.speedKph}km/h · N${frame.gear}` : "Tap to stream cockpit"}</div>
            </button>
          </div>

          {/* Driver cam panel (mock viewport) */}
          {driverCam && (
            <div className="relative h-20 overflow-hidden rounded-xl border border-pit-yellow/40 bg-pit-bg">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, rgba(255,212,0,0.15) 0 2px, transparent 2px 12px)",
                  transform: `translateX(${(frame.t / 8) % 100}px)`,
                }}
              />
              <div className="absolute left-2 top-1 flex gap-2 text-[9px] uppercase tracking-widest text-pit-yellow">
                <span className="blink">● REC</span><span>CAR #44</span>
              </div>
              <div className="absolute bottom-1 right-2 text-[10px] font-bold tabular-nums text-pit-text">
                {frame.speedKph} km/h · DRS {frame.speedKph > 280 ? "ON" : "OFF"}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
