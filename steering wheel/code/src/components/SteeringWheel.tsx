import { useEffect, useMemo, useRef, useState } from "react";
import {
  Flag,
  Zap,
  Gauge,
  ArrowUpCircle,
  Wind,
  Battery,
  Fuel,
  Thermometer,
  Timer,
  Users,
  ShieldAlert,
  Radio,
  Eye,
  EyeOff,
  TriangleAlert,
  CircleDot,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

type Phase = "qualifying" | "race" | "safety";
type AlertLevel = 1 | 2 | 3;
type AlertColor = "red" | "yellow" | "green" | "blue" | "white";
type AlertItem = { color: AlertColor; level: AlertLevel; msg: string; icon?: typeof Flag };

const LED_COUNT = 15;

const COLOR_MAP: Record<AlertColor, string> = {
  red: "oklch(0.65 0.26 25)",
  yellow: "oklch(0.85 0.2 90)",
  green: "oklch(0.72 0.21 145)",
  blue: "oklch(0.7 0.18 240)",
  white: "oklch(0.95 0 0)",
};

function ShiftLights({ rpm }: { rpm: number }) {
  const active = Math.round(rpm * LED_COUNT);
  return (
    <div className="flex items-center justify-center gap-1.5 px-6 py-2 rounded-full bg-black/60 border border-border/60 shadow-inner">
      {Array.from({ length: LED_COUNT }).map((_, i) => {
        const on = i < active;
        let color = COLOR_MAP.green;
        if (i >= 6 && i < 11) color = COLOR_MAP.yellow;
        if (i >= 11) color = COLOR_MAP.red;
        return (
          <span
            key={i}
            className={`h-2.5 w-3 rounded-sm transition-all ${on ? "led-on" : ""}`}
            style={{ backgroundColor: color, opacity: on ? 1 : 0.12, color }}
          />
        );
      })}
    </div>
  );
}

function TireIndicator({
  label,
  temp,
}: {
  label: string;
  temp: number; // °C
}) {
  // 70-110 optimal green, <70 cold blue, 110-125 warn yellow, >125 crit red
  let status: "cold" | "ok" | "warn" | "crit" = "ok";
  if (temp < 70) status = "cold";
  else if (temp > 125) status = "crit";
  else if (temp > 110) status = "warn";
  const color =
    status === "ok"
      ? COLOR_MAP.green
      : status === "warn"
      ? COLOR_MAP.yellow
      : status === "crit"
      ? COLOR_MAP.red
      : COLOR_MAP.blue;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="h-10 w-7 rounded-md led-on relative overflow-hidden transition-colors"
        style={{ backgroundColor: color, color }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 text-center text-[8px] font-display font-bold text-black/70">
          {temp}°
        </div>
      </div>
      <span className="text-[10px] font-display tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function VBar({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof Fuel;
  value: number;
  label: string;
  color: string;
}) {
  const segments = 10;
  const filled = Math.round((value / 100) * segments);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <div className="flex flex-col-reverse gap-0.5 h-24 w-3 p-0.5 rounded-sm bg-black/60 border border-border/60">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-[1px] transition-colors"
            style={{
              backgroundColor: i < filled ? color : "oklch(0.3 0.01 250 / 0.5)",
              boxShadow: i < filled ? `0 0 4px ${color}` : "none",
            }}
          />
        ))}
      </div>
      <span className="text-[10px] font-display tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="text-[11px] font-display text-foreground">{value}%</span>
    </div>
  );
}

function Dial({
  label,
  value,
  onClick,
  angle = 0,
}: {
  label: string;
  value: string | number;
  onClick?: () => void;
  angle?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-1 group"
    >
      <div className="relative h-16 w-16 rounded-full carbon border-4 border-border shadow-[0_8px_20px_-4px_rgba(0,0,0,0.7)] flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95">
        <div
          className="absolute inset-2 rounded-full bg-gradient-to-br from-secondary to-background border border-border/60"
          style={{
            backgroundImage:
              "repeating-conic-gradient(from 0deg, oklch(0.3 0.01 250) 0deg 12deg, oklch(0.22 0.012 250) 12deg 24deg)",
            transform: `rotate(${angle}deg)`,
            transition: "transform 0.25s ease-out",
          }}
        />
        <div className="relative h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center">
          <span className="text-xs font-display font-bold text-accent">{value}</span>
        </div>
        <div
          className="absolute top-1 left-1/2 h-2 w-1 rounded-full bg-accent led-on"
          style={{
            color: COLOR_MAP.yellow,
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transformOrigin: "50% 30px",
            transition: "transform 0.25s ease-out",
          }}
        />
      </div>
      <span className="text-[9px] font-display tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
    </button>
  );
}

function PushButton({
  label,
  color = "bg-secondary",
  text = "text-foreground",
  onPress,
  flash,
}: {
  label: string;
  color?: string;
  text?: string;
  onPress?: () => void;
  flash?: boolean;
}) {
  return (
    <button
      onClick={onPress}
      className={`relative ${color} ${text} font-display font-bold text-[10px] tracking-widest uppercase rounded-md px-2.5 py-2 border border-border/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_3px_0_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-none transition-all hover:brightness-110 ${
        flash ? "ring-2 ring-offset-1 ring-offset-background ring-accent" : ""
      }`}
    >
      {label}
    </button>
  );
}

function ActionButton({
  icon: Icon,
  label,
  bg,
  active,
  onPress,
}: {
  icon: typeof Zap;
  label: string;
  bg: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <button
      onClick={onPress}
      className={`flex items-center gap-1 text-primary-foreground font-display font-bold text-[10px] tracking-widest uppercase rounded-md px-3 py-2 led-on shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_3px_0_rgba(0,0,0,0.5)] active:translate-y-0.5 transition-all ${
        active ? "ring-2 ring-white/80 brightness-125 animate-pulse" : ""
      }`}
      style={{ backgroundColor: bg, color: bg }}
    >
      <Icon className="h-3.5 w-3.5 text-primary-foreground" />
      <span className="text-primary-foreground">{label}</span>
    </button>
  );
}

function PhaseTab({
  active,
  label,
  onClick,
  icon: Icon,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  icon: typeof Flag;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-display text-[10px] tracking-[0.25em] uppercase border transition-all ${
        active
          ? "bg-primary text-primary-foreground border-primary led-on"
          : "bg-secondary/60 text-muted-foreground border-border/60 hover:text-foreground"
      }`}
      style={active ? { color: COLOR_MAP.green } : undefined}
    >
      <Icon className="h-3 w-3" style={{ color: active ? "currentColor" : undefined }} />
      <span className={active ? "text-primary-foreground" : ""}>{label}</span>
    </button>
  );
}

function SectorPips({ sectors }: { sectors: Array<"purple" | "green" | "yellow" | "none"> }) {
  return (
    <div className="flex gap-1">
      {sectors.map((s, i) => {
        const c =
          s === "purple"
            ? "oklch(0.55 0.25 305)"
            : s === "green"
            ? COLOR_MAP.green
            : s === "yellow"
            ? COLOR_MAP.yellow
            : "oklch(0.3 0.01 250)";
        return (
          <span
            key={i}
            className="h-1.5 w-6 rounded-sm"
            style={{ backgroundColor: c, boxShadow: s !== "none" ? `0 0 6px ${c}` : "none" }}
          />
        );
      })}
    </div>
  );
}

export default function SteeringWheel() {
  const [phase, setPhase] = useState<Phase>("race");
  const [minimal, setMinimal] = useState(false);
  const [speed, setSpeed] = useState(287);
  const [gear, setGear] = useState(6);
  const [rpm, setRpm] = useState(0.55);
  const [delta, setDelta] = useState(-0.342);
  const [lap, setLap] = useState(34);
  const [fuel, setFuel] = useState(62);
  const [ers, setErs] = useState(84);
  const [tires, setTires] = useState({ FL: 92, FR: 105, RL: 98, RR: 110 });
  const [drsActive, setDrsActive] = useState(false);
  const [overtake, setOvertake] = useState(false);
  const [pressFlash, setPressFlash] = useState<string | null>(null);
  const [scTimer, setScTimer] = useState(8);
  const restartRef = useRef(0);

  // Adjustable settings via dials
  const [brkBal, setBrkBal] = useState(54);
  const [diff, setDiff] = useState(3);
  const [ersMode, setErsMode] = useState(7);
  const [engineMode, setEngineMode] = useState(2);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 1800);
  };

  // Simulate live data
  useEffect(() => {
    const t = setInterval(() => {
      setSpeed((s) => {
        const cap = phase === "safety" ? 140 : 348;
        return Math.max(60, Math.min(cap, s + Math.round((Math.random() - 0.4) * 14)));
      });
      setRpm((r) => {
        const max = phase === "safety" ? 0.5 : 1;
        const next = r + (Math.random() - 0.45) * 0.18;
        return Math.max(0.15, Math.min(max, next));
      });
      setDelta((d) => +(d + (Math.random() - 0.5) * 0.08).toFixed(3));
      if (Math.random() < 0.08)
        setGear((g) => Math.max(1, Math.min(8, g + (Math.random() > 0.5 ? 1 : -1))));
      if (Math.random() < 0.02) setLap((l) => l + 1);
      if (Math.random() < 0.05) setFuel((f) => Math.max(0, +(f - 0.1).toFixed(0)));
      // Tires drift continuously so status cycles naturally
      setTires((t) => {
        const drift = () => Math.round((Math.random() - 0.5) * 4);
        const clamp = (v: number) => Math.max(60, Math.min(140, v));
        // Gentle pull toward optimal range (90-110) so it cycles
        const pull = (v: number) => (v > 115 ? -1 : v < 85 ? 1 : 0);
        return {
          FL: clamp(t.FL + drift() + pull(t.FL)),
          FR: clamp(t.FR + drift() + pull(t.FR)),
          RL: clamp(t.RL + drift() + pull(t.RL)),
          RR: clamp(t.RR + drift() + pull(t.RR)),
        };
      });
    }, 240);
    return () => clearInterval(t);
  }, [phase]);

  // Safety car restart countdown
  useEffect(() => {
    if (phase !== "safety") return;
    const t = setInterval(() => {
      restartRef.current += 1;
      setScTimer((s) => (s > 0 ? s - 1 : 8));
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Phase-aware alert queue (single highest-priority alert visible)
  const alertQueue = useMemo<AlertItem[]>(() => {
    const tireCrit = Math.max(...Object.values(tires)) > 125;
    const items: AlertItem[] = [];
    if (tireCrit)
      items.push({ color: "red", level: 3, msg: "TIRE CRITICAL · RR", icon: TriangleAlert });
    if (phase === "safety")
      items.push({ color: "yellow", level: 2, msg: "SAFETY CAR · DELTA +0.0", icon: ShieldAlert });
    if (phase === "qualifying")
      items.push({ color: "blue", level: 1, msg: "PUSH LAP · SECTOR 2", icon: Timer });
    if (phase === "race")
      items.push({ color: "blue", level: 1, msg: "VER +0.342 · GAIN", icon: Users });
    items.push({ color: "white", level: 1, msg: "TRACK CLEAR", icon: Flag });
    return items.sort((a, b) => b.level - a.level);
  }, [phase, tires]);

  const topAlert = alertQueue[0];
  const alertColor = COLOR_MAP[topAlert.color];

  // Press feedback helper
  const press = (id: string, fn?: () => void) => {
    setPressFlash(id);
    fn?.();
    setTimeout(() => setPressFlash((p) => (p === id ? null : p)), 350);
  };

  const deltaPositive = delta < 0;
  const deltaColor = deltaPositive ? COLOR_MAP.green : COLOR_MAP.red;

  return (
    <div className="relative w-full max-w-[1100px] aspect-[16/11]">
      {/* Phase + minimal toggle bar */}
      <div className="absolute -top-12 left-0 right-0 flex items-center justify-between">
        <div className="flex gap-2">
          <PhaseTab
            active={phase === "qualifying"}
            label="Qualifying"
            icon={Timer}
            onClick={() => setPhase("qualifying")}
          />
          <PhaseTab
            active={phase === "race"}
            label="Race"
            icon={Flag}
            onClick={() => setPhase("race")}
          />
          <PhaseTab
            active={phase === "safety"}
            label="Safety Car"
            icon={ShieldAlert}
            onClick={() => setPhase("safety")}
          />
        </div>
        <button
          onClick={() => setMinimal((m) => !m)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-display text-[10px] tracking-[0.25em] uppercase border border-border/60 bg-secondary/60 text-muted-foreground hover:text-foreground transition-all"
        >
          {minimal ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          {minimal ? "Full" : "Minimal"}
        </button>
      </div>

      {/* Wheel body */}
      <div className="absolute inset-0 wheel-surface rounded-[14%/20%] border border-border/60 shadow-[var(--shadow-deep)]">
        <div className="absolute -top-2 left-6 right-6 h-3 rounded-b-full bg-gradient-to-b from-black to-transparent opacity-60" />
        <div className="absolute left-0 top-1/3 -translate-x-2 w-10 h-44 rounded-l-[40%] carbon border border-border shadow-xl" />
        <div className="absolute right-0 top-1/3 translate-x-2 w-10 h-44 rounded-r-[40%] carbon border border-border shadow-xl" />

        <div className="relative h-full w-full p-6 flex flex-col">
          {/* Shift light strip — always visible */}
          <div className="flex justify-center">
            <ShiftLights rpm={rpm} />
          </div>

          {/* Main row */}
          <div className="flex-1 grid grid-cols-[1fr_2fr_1fr] gap-4 mt-4">
            {/* LEFT — vehicle / phase-aware */}
            <div
              className={`flex flex-col gap-3 bg-card/60 rounded-2xl p-3 border border-border/60 backdrop-blur-sm transition-all duration-500 ${
                minimal ? "opacity-30 blur-[1px]" : "opacity-100 animate-fade-in"
              }`}
              key={`left-${phase}`}
            >
              <div className="text-[10px] font-display tracking-[0.25em] text-muted-foreground flex items-center gap-1.5">
                <Gauge className="h-3 w-3" /> VEHICLE
              </div>

              <div className="grid grid-cols-2 gap-2">
                <TireIndicator label="FL" temp={tires.FL} />
                <TireIndicator label="FR" temp={tires.FR} />
                <TireIndicator label="RL" temp={tires.RL} />
                <TireIndicator label="RR" temp={tires.RR} />
              </div>

              {/* Phase-specific lower panel */}
              {phase === "race" && (
                <div className="flex justify-around mt-auto animate-fade-in">
                  <VBar icon={Fuel} value={fuel} label="FUEL" color={COLOR_MAP.yellow} />
                  <VBar icon={Battery} value={ers} label="ERS" color={COLOR_MAP.green} />
                </div>
              )}
              {phase === "qualifying" && (
                <div className="mt-auto animate-fade-in flex flex-col gap-2">
                  <div className="text-[9px] font-display tracking-[0.3em] text-muted-foreground flex items-center gap-1">
                    <Thermometer className="h-3 w-3" /> TIRE AVG
                  </div>
                  <div className="text-3xl font-display font-bold text-foreground tabular-nums">
                    112°
                  </div>
                  <div className="h-1.5 w-full rounded-full overflow-hidden bg-black/60">
                    <div
                      className="h-full"
                      style={{
                        width: "72%",
                        background: `linear-gradient(90deg, ${COLOR_MAP.blue}, ${COLOR_MAP.green}, ${COLOR_MAP.yellow}, ${COLOR_MAP.red})`,
                      }}
                    />
                  </div>
                </div>
              )}
              {phase === "safety" && (
                <div className="mt-auto animate-fade-in flex flex-col gap-2 items-center">
                  <div className="text-[9px] font-display tracking-[0.3em] text-muted-foreground">
                    DELTA TARGET
                  </div>
                  <div className="text-2xl font-display font-bold text-accent tabular-nums">
                    +1.450
                  </div>
                  <div className="text-[9px] font-display text-muted-foreground tracking-widest">
                    HOLD PACE
                  </div>
                </div>
              )}
            </div>

            {/* CENTER — speed + gear (always visible) */}
            <div className="flex flex-col items-center justify-between bg-black/70 rounded-2xl border border-border/80 p-4 relative overflow-hidden">
              <div
                className="absolute inset-0 pointer-events-none opacity-40 transition-colors duration-700"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 30%, ${alertColor} / 0.15, transparent 60%)`,
                }}
              />
              <div className="flex w-full items-start justify-between text-[10px] font-display tracking-widest text-muted-foreground z-10">
                <span>LAP {lap}/58</span>
                <span className="flex items-center gap-1">
                  <CircleDot className="h-2.5 w-2.5" style={{ color: COLOR_MAP.green }} /> P3
                </span>
              </div>

              <div className="flex items-center justify-center gap-6 -mt-1 z-10">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-display tracking-[0.3em] text-muted-foreground">
                    GEAR
                  </span>
                  <span className="font-display text-glow-gear text-[9rem] leading-none font-bold" style={{ color: COLOR_MAP.yellow }}>
                    {gear}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center -mt-2 z-10">
                <span className="font-display text-foreground text-glow-primary text-[5rem] leading-none font-semibold tabular-nums">
                  {speed}
                </span>
                <span className="text-[10px] font-display tracking-[0.4em] text-muted-foreground -mt-1">
                  KM/H
                </span>
              </div>
            </div>

            {/* RIGHT — race context, phase-aware */}
            <div
              className={`flex flex-col gap-3 bg-card/60 rounded-2xl p-3 border border-border/60 backdrop-blur-sm transition-all duration-500 ${
                minimal ? "opacity-30 blur-[1px]" : "opacity-100 animate-fade-in"
              }`}
              key={`right-${phase}`}
            >
              <div className="text-[10px] font-display tracking-[0.25em] text-muted-foreground flex items-center gap-1.5">
                <Flag className="h-3 w-3" />
                {phase === "qualifying" ? "QUALIFYING" : phase === "safety" ? "SAFETY CAR" : "RACE"}
              </div>

              {/* Delta — always */}
              <div className="flex flex-col items-center bg-black/60 rounded-lg py-3 border border-border/60">
                <span className="text-[9px] font-display tracking-[0.3em] text-muted-foreground">
                  DELTA
                </span>
                <div className="flex items-center gap-1">
                  {deltaPositive ? (
                    <TrendingDown className="h-4 w-4" style={{ color: deltaColor }} />
                  ) : (
                    <TrendingUp className="h-4 w-4" style={{ color: deltaColor }} />
                  )}
                  <span
                    className="font-display text-3xl font-bold tabular-nums"
                    style={{ color: deltaColor }}
                  >
                    {deltaPositive ? "" : "+"}
                    {delta.toFixed(3)}
                  </span>
                </div>
                <span className="text-[9px] font-display tracking-widest text-muted-foreground">
                  vs BEST
                </span>
              </div>

              {/* Phase-specific middle panel */}
              {phase === "qualifying" && (
                <div className="bg-black/60 rounded-lg p-2 border border-border/60 animate-fade-in">
                  <div className="text-[9px] font-display tracking-[0.3em] text-muted-foreground mb-1.5">
                    SECTORS
                  </div>
                  <SectorPips sectors={["purple", "green", "none"]} />
                  <div className="flex justify-between mt-1.5 text-[10px] font-display tabular-nums text-foreground">
                    <span>22.418</span>
                    <span>31.205</span>
                    <span>—</span>
                  </div>
                </div>
              )}
              {phase === "race" && (
                <div className="bg-black/60 rounded-lg p-2 border border-border/60 animate-fade-in">
                  <div className="text-[9px] font-display tracking-[0.3em] text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Users className="h-3 w-3" /> GAPS
                  </div>
                  <div className="flex flex-col gap-1 text-[11px] font-display tabular-nums">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">P2 HAM</span>
                      <span style={{ color: COLOR_MAP.green }}>-1.842</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">P4 LEC</span>
                      <span style={{ color: COLOR_MAP.red }}>+0.612</span>
                    </div>
                  </div>
                  <div className="text-[9px] mt-2 text-muted-foreground tracking-widest">
                    STRAT · PLAN B · BOX L38
                  </div>
                </div>
              )}
              {phase === "safety" && (
                <div className="bg-black/60 rounded-lg p-3 border border-border/60 animate-fade-in flex flex-col items-center">
                  <div className="text-[9px] font-display tracking-[0.3em] text-muted-foreground">
                    RESTART IN
                  </div>
                  <div
                    className="font-display text-5xl font-bold tabular-nums led-on"
                    style={{ color: COLOR_MAP.yellow }}
                  >
                    {scTimer}
                  </div>
                  <div className="text-[9px] font-display tracking-widest text-muted-foreground">
                    SECONDS
                  </div>
                </div>
              )}

              {/* Layered alert (level 1 = subtle, 2 = blink+icon, 3 = handled by overlay below) */}
              <div
                className={`mt-auto rounded-lg px-2 py-2 text-center border transition-all ${
                  topAlert.level === 2 ? "animate-pulse led-on" : ""
                }`}
                style={{
                  borderColor: alertColor,
                  color: alertColor,
                  backgroundColor: "oklch(0.12 0.01 250 / 0.7)",
                }}
              >
                <div className="text-[9px] font-display tracking-[0.3em] opacity-80 flex items-center justify-center gap-1">
                  {topAlert.icon ? (
                    <topAlert.icon className="h-3 w-3" />
                  ) : null}
                  ALERT · L{topAlert.level}
                </div>
                <div className="font-display font-bold text-[11px] tracking-wider mt-0.5">
                  {topAlert.msg}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom — physical controls */}
          <div
            className={`mt-4 grid grid-cols-[auto_1fr_auto] gap-4 items-end transition-all duration-500 ${
              minimal ? "opacity-40" : "opacity-100"
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-3">
                <Dial
                  label="BRK BAL"
                  value={brkBal}
                  angle={(brkBal - 50) * 12}
                  onClick={() => {
                    setBrkBal((v) => (v >= 60 ? 48 : v + 1));
                    showToast(`Brake bal ${brkBal + 1}%`);
                  }}
                />
                <Dial
                  label="DIFF"
                  value={diff}
                  angle={diff * 36}
                  onClick={() => {
                    const next = diff >= 8 ? 1 : diff + 1;
                    setDiff(next);
                    showToast(`Differential ${next}`);
                  }}
                />
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <PushButton
                  label="Radio"
                  flash={pressFlash === "radio"}
                  onPress={() => {
                    press("radio");
                    showToast("Radio · Channel open");
                  }}
                />
                <PushButton
                  label="Pit"
                  color="bg-[oklch(0.7_0.18_240)]"
                  text="text-background"
                  flash={pressFlash === "pit"}
                  onPress={() => {
                    press("pit");
                    showToast("Pit · Confirmed");
                  }}
                />
                <PushButton
                  label="Ack"
                  flash={pressFlash === "ack"}
                  onPress={() => {
                    press("ack");
                    showToast("Acknowledged");
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-14 w-40 carbon rounded-lg border border-border flex items-center justify-center shadow-inner">
                <span className="font-display text-xs tracking-[0.5em] text-muted-foreground">
                  APEX · F1
                </span>
              </div>
              <div className="flex gap-2">
                <ActionButton
                  icon={ArrowUpCircle}
                  label="Overtake"
                  bg={COLOR_MAP.green}
                  active={overtake}
                  onPress={() => {
                    setOvertake((v) => !v);
                    press("overtake");
                    showToast(overtake ? "Overtake OFF" : "Overtake ON");
                  }}
                />
                <ActionButton
                  icon={Wind}
                  label="DRS"
                  bg={COLOR_MAP.yellow}
                  active={drsActive}
                  onPress={() => {
                    setDrsActive((v) => !v);
                    press("drs");
                    showToast(drsActive ? "DRS closed" : "DRS open");
                  }}
                />
                <ActionButton
                  icon={Zap}
                  label="Boost"
                  bg={COLOR_MAP.red}
                  onPress={() => {
                    press("boost");
                    setErs((e) => Math.min(100, e + 5));
                    showToast("Boost deployed +5% ERS");
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-3">
                <Dial
                  label="ERS"
                  value={ersMode}
                  angle={ersMode * 36}
                  onClick={() => {
                    const next = ersMode >= 9 ? 1 : ersMode + 1;
                    setErsMode(next);
                    showToast(`ERS map ${next}`);
                  }}
                />
                <Dial
                  label="ENGINE"
                  value={engineMode}
                  angle={engineMode * 45}
                  onClick={() => {
                    const next = engineMode >= 6 ? 1 : engineMode + 1;
                    setEngineMode(next);
                    showToast(`Engine mode ${next}`);
                  }}
                />
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <PushButton
                  label="Box"
                  flash={pressFlash === "box"}
                  onPress={() => {
                    press("box");
                    showToast("Box this lap");
                  }}
                />
                <PushButton
                  label="OK"
                  color="bg-[oklch(0.72_0.21_145)]"
                  text="text-primary-foreground"
                  flash={pressFlash === "ok"}
                  onPress={() => {
                    press("ok");
                    showToast("Team acknowledged");
                  }}
                />
                <PushButton
                  label="Cam"
                  flash={pressFlash === "cam"}
                  onPress={() => {
                    press("cam");
                    showToast("Onboard cam toggled");
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action toast — visual confirmation of last interaction */}
        {toast && (
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 animate-fade-in"
          >
            <div
              className="px-4 py-1.5 rounded-full font-display text-[10px] tracking-[0.3em] uppercase border led-on"
              style={{
                color: COLOR_MAP.green,
                borderColor: COLOR_MAP.green,
                backgroundColor: "oklch(0 0 0 / 0.85)",
              }}
            >
              {toast}
            </div>
          </div>
        )}

        {/* Level 3 critical overlay — full-screen warning across the wheel */}
        {topAlert.level === 3 && (
          <div
            className="absolute inset-0 rounded-[14%/20%] pointer-events-none animate-fade-in z-20"
            style={{
              background: `radial-gradient(circle at center, ${alertColor} / 0.0, ${alertColor} / 0.18)`,
              boxShadow: `inset 0 0 80px ${alertColor}, inset 0 0 24px ${alertColor}`,
            }}
          >
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 rounded-xl border-2 font-display font-bold tracking-[0.3em] text-sm animate-pulse"
              style={{
                color: alertColor,
                borderColor: alertColor,
                backgroundColor: "oklch(0 0 0 / 0.7)",
                boxShadow: `0 0 40px ${alertColor}`,
              }}
            >
              <div className="flex items-center gap-2">
                <TriangleAlert className="h-5 w-5" />
                {topAlert.msg}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute -bottom-2 left-1/4 right-1/4 h-2 bg-gradient-to-b from-black/60 to-transparent blur-sm" />
    </div>
  );
}
