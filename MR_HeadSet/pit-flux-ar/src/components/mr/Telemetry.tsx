import type { Telemetry } from "./hooks";
import { cn } from "@/lib/utils";

const tempColor = (t: number) => {
  if (t > 115) return "text-hud-red";
  if (t > 105) return "text-hud-amber";
  if (t < 85) return "text-hud-blue";
  return "text-hud-green";
};

export function TireGrid({ tires, wear }: { tires: Telemetry["tires"]; wear: Telemetry["tireWear"] }) {
  const items: { key: keyof Telemetry["tires"]; label: string }[] = [
    { key: "fl", label: "FL" }, { key: "fr", label: "FR" },
    { key: "rl", label: "RL" }, { key: "rr", label: "RR" },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(({ key, label }) => {
        const t = tires[key];
        const w = wear[key];
        return (
          <div key={key} className="relative rounded border border-panel-border bg-black/30 p-2">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="font-display tracking-widest">{label}</span>
              <span className="text-hud-cyan">C3 SOFT</span>
            </div>
            <div className={cn("font-display text-2xl mt-0.5", tempColor(t))}>{t.toFixed(0)}°</div>
            <div className="mt-1 h-1 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full"
                style={{
                  width: `${100 - w}%`,
                  background: w > 60 ? "var(--hud-red)" : w > 35 ? "var(--hud-amber)" : "var(--hud-green)",
                }}
              />
            </div>
            <div className="mt-1 text-[9px] text-muted-foreground flex justify-between">
              <span>WEAR</span><span className="font-mono-hud">{w.toFixed(0)}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BrakeGrid({ brakes }: { brakes: Telemetry["brakes"] }) {
  const items: { key: keyof Telemetry["brakes"]; label: string }[] = [
    { key: "fl", label: "FL" }, { key: "fr", label: "FR" },
    { key: "rl", label: "RL" }, { key: "rr", label: "RR" },
  ];
  const c = (v: number) => v > 650 ? "text-hud-red" : v > 580 ? "text-hud-amber" : "text-hud-cyan";
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {items.map(({ key, label }) => (
        <div key={key} className="rounded border border-panel-border bg-black/30 p-1.5 text-center">
          <div className="text-[9px] text-muted-foreground font-display tracking-widest">{label}</div>
          <div className={cn("font-display text-sm", c(brakes[key]))}>{brakes[key].toFixed(0)}</div>
          <div className="text-[8px] text-muted-foreground">°C</div>
        </div>
      ))}
    </div>
  );
}

export function RadialGauge({
  value, max, label, unit, accent = "cyan", size = 130,
}: { value: number; max: number; label: string; unit: string; accent?: "cyan" | "amber" | "magenta"; size?: number }) {
  const pct = Math.min(1, value / max);
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const stroke = c * (1 - pct * 0.75);
  const color = accent === "amber" ? "var(--hud-amber)" : accent === "magenta" ? "var(--hud-magenta)" : "var(--hud-cyan)";

  // Tick marks
  const ticks = Array.from({ length: 13 }, (_, i) => i);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[135deg]">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="oklch(0.3 0.04 240 / 0.5)" strokeWidth={3} strokeDasharray={c} strokeDashoffset={c * 0.25} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={3}
          strokeDasharray={c} strokeDashoffset={stroke}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dashoffset 0.4s" }}
        />
        {ticks.map((i) => {
          const a = (i / 12) * 270;
          const rad = (a * Math.PI) / 180;
          const x1 = size/2 + Math.cos(rad) * (r - 4);
          const y1 = size/2 + Math.sin(rad) * (r - 4);
          const x2 = size/2 + Math.cos(rad) * (r + 2);
          const y2 = size/2 + Math.sin(rad) * (r + 2);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeOpacity={0.5} strokeWidth={1} />;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-2xl text-glow-cyan" style={{ color }}>{value.toFixed(0)}</div>
        <div className="text-[9px] text-muted-foreground">{unit}</div>
        <div className="text-[10px] text-muted-foreground font-display tracking-widest mt-0.5">{label}</div>
      </div>
    </div>
  );
}

export function GearIndicator({ gear, drs }: { gear: number; drs: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <div className="font-display text-6xl text-hud-cyan text-glow-cyan tabular-nums">{gear}</div>
        <div className="absolute -top-1 -right-3 text-[9px] text-muted-foreground">GEAR</div>
      </div>
      <div className={cn(
        "text-[10px] font-display tracking-widest px-2 py-0.5 rounded border transition-all",
        drs ? "text-hud-green border-hud-green bg-hud-green/10 animate-hud-pulse" : "text-muted-foreground border-panel-border"
      )}>
        DRS {drs ? "OPEN" : "CLOSED"}
      </div>
    </div>
  );
}

export function BarMeter({ label, value, max = 100, accent = "cyan", unit = "%" }: { label: string; value: number; max?: number; accent?: "cyan" | "amber" | "green" | "red"; unit?: string }) {
  const pct = (value / max) * 100;
  const color = accent === "amber" ? "var(--hud-amber)" : accent === "green" ? "var(--hud-green)" : accent === "red" ? "var(--hud-red)" : "var(--hud-cyan)";
  return (
    <div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground font-display tracking-widest">{label}</span>
        <span className="font-mono-hud" style={{ color }}>{value.toFixed(0)}{unit}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
    </div>
  );
}

export function MiniSpark({ data, color = "var(--hud-cyan)" }: { data: { v: number }[]; color?: string }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.v));
  const min = Math.min(...data.map((d) => d.v));
  const range = max - min || 1;
  const w = 200, h = 50;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d.v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="w-full">
      <defs>
        <linearGradient id={`sp-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={`url(#sp-${color})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
    </svg>
  );
}
