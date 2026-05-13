import type { Telemetry } from "./hooks";
import { cn } from "@/lib/utils";

export function DriverStream({ t }: { t: Telemetry }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded">
      {/* Faux cockpit view */}
      <div className="absolute inset-0">
        {/* Sky/track gradient */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, oklch(0.25 0.04 240) 0%, oklch(0.18 0.03 245) 40%, oklch(0.1 0.02 250) 60%, oklch(0.08 0.02 250) 100%)"
        }} />
        {/* Track perspective */}
        <svg viewBox="0 0 400 240" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="track" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.2 0.02 250)" />
              <stop offset="100%" stopColor="oklch(0.1 0.01 250)" />
            </linearGradient>
          </defs>
          <polygon points="180,140 220,140 320,240 80,240" fill="url(#track)" />
          {/* Curbs */}
          <polygon points="180,140 178,142 78,242 80,240" fill="oklch(0.65 0.27 25)" opacity="0.7" />
          <polygon points="220,140 222,142 322,242 320,240" fill="oklch(0.96 0 0)" opacity="0.6" />
          {/* Racing line */}
          <path d="M 200 140 Q 210 180 240 240" stroke="oklch(0.85 0.18 200)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" opacity="0.7" style={{ filter: "drop-shadow(0 0 4px oklch(0.85 0.18 200))" }} />
          {/* Center dashes */}
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={199} y={150 + i * 24} width={2} height={10 + i * 2} fill="oklch(0.96 0 0)" opacity={0.4 + i * 0.1} />
          ))}
        </svg>
        {/* Steering wheel silhouette */}
        <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMax meet" className="absolute inset-0 w-full h-full">
          <path d="M 100 240 L 100 210 Q 100 180 140 175 L 260 175 Q 300 180 300 210 L 300 240 Z" fill="oklch(0.06 0 0)" stroke="oklch(0.3 0.04 240)" strokeWidth="1" />
          <rect x="160" y="185" width="80" height="22" rx="3" fill="oklch(0.1 0.02 250)" stroke="oklch(0.85 0.18 200 / 0.4)" />
          <text x="200" y="201" textAnchor="middle" fill="oklch(0.85 0.18 200)" fontSize="10" fontFamily="monospace" style={{ filter: "drop-shadow(0 0 3px oklch(0.85 0.18 200))" }}>
            {t.gear}  {t.speed.toFixed(0)}
          </text>
        </svg>
        {/* Scanlines */}
        <div className="absolute inset-0 scanlines pointer-events-none" />
        {/* Sweep */}
        <div className="absolute inset-x-0 h-12 pointer-events-none animate-scan-sweep" style={{
          background: "linear-gradient(to bottom, transparent, oklch(0.85 0.18 200 / 0.08), transparent)"
        }} />
      </div>

      {/* HUD overlays */}
      <div className="absolute top-2 left-2 flex items-center gap-2">
        <span className="text-[10px] font-display tracking-widest text-hud-red animate-hud-pulse">● LIVE</span>
        <span className="text-[10px] text-muted-foreground">CAM 01 — COCKPIT</span>
      </div>
      <div className="absolute top-2 right-2 flex gap-2">
        {["COCKPIT", "ONBOARD", "T-CAM", "HELMET"].map((c, i) => (
          <span key={c} className={cn(
            "text-[9px] px-1.5 py-0.5 rounded border font-display tracking-widest",
            i === 0 ? "bg-hud-cyan/10 text-hud-cyan border-hud-cyan/40" : "border-panel-border text-muted-foreground"
          )}>{c}</span>
        ))}
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-0 inset-x-0 p-3 pt-8" style={{ background: "linear-gradient(to top, oklch(0.08 0.02 250 / 0.9), transparent)" }}>
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-1">
            <div className="text-[9px] text-muted-foreground font-display tracking-widest">SPEED</div>
            <div className="font-display text-4xl text-hud-cyan text-glow-cyan tabular-nums">{t.speed.toFixed(0)}<span className="text-[10px] text-muted-foreground ml-1">KPH</span></div>
          </div>
          <div className="flex-1 max-w-md space-y-1.5">
            <div className="flex items-center justify-between text-[9px] text-muted-foreground font-display tracking-widest">
              <span>THROTTLE</span><span>{t.throttle.toFixed(0)}%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-hud-green" style={{ width: `${t.throttle}%`, boxShadow: "0 0 8px var(--hud-green)" }} />
            </div>
            <div className="flex items-center justify-between text-[9px] text-muted-foreground font-display tracking-widest">
              <span>BRAKE</span><span>{t.brake.toFixed(0)}%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-hud-red" style={{ width: `${t.brake}%`, boxShadow: "0 0 8px var(--hud-red)" }} />
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="text-[9px] text-muted-foreground font-display tracking-widest">PIT WINDOW</div>
            <div className="font-display text-xl text-hud-amber text-glow-amber">L 30–32</div>
            <div className="text-[9px] text-hud-amber/80">OVERTAKE READY</div>
          </div>
        </div>
      </div>
    </div>
  );
}
