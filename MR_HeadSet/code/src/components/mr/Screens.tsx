import { motion } from "framer-motion";
import {
  Brain, Users, BarChart3, Settings2, Radio, Flag, Trophy,
  Cpu, Thermometer, Wind, Droplets, Wrench, Timer, MapPin, Radar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Telemetry } from "./hooks";
import { MiniSpark, BarMeter } from "./Telemetry";

export type ScreenMode = "race" | "strategy" | "crew" | "analytics" | "replay" | "settings";

export const SCREENS: { id: ScreenMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "race", label: "RACE HUD", icon: Flag },
  { id: "strategy", label: "STRATEGY", icon: Brain },
  { id: "crew", label: "CREW", icon: Users },
  { id: "analytics", label: "ANALYTICS", icon: BarChart3 },
  { id: "replay", label: "REPLAY", icon: Radar },
  { id: "settings", label: "SPATIAL", icon: Settings2 },
];

export function ScreenSwitcher({ mode, onChange }: { mode: ScreenMode; onChange: (m: ScreenMode) => void }) {
  return (
    <div className="flex items-center gap-1 panel-glass rounded-md px-1.5 py-1">
      {SCREENS.map((s) => {
        const Icon = s.icon;
        const active = s.id === mode;
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-display tracking-[0.18em] transition-colors",
              active
                ? "bg-hud-cyan/15 text-hud-cyan border border-hud-cyan/40 text-glow-cyan"
                : "text-muted-foreground border border-transparent hover:text-hud-cyan hover:border-hud-cyan/20"
            )}
          >
            <Icon className="h-3 w-3" />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

function ScreenShell({ children, title, subtitle, accent = "cyan" }: {
  children: React.ReactNode; title: string; subtitle?: string; accent?: "cyan" | "amber" | "magenta";
}) {
  const c = accent === "amber" ? "text-hud-amber" : accent === "magenta" ? "text-hud-magenta" : "text-hud-cyan";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.4 }}
      className="absolute inset-x-4 top-[72px] bottom-[72px] panel-glass corner-brackets rounded-lg overflow-hidden flex flex-col"
    >
      <div className="px-5 py-2.5 border-b border-panel-border flex items-center justify-between">
        <div>
          <div className={cn("font-display text-xs tracking-[0.3em]", c)}>{title}</div>
          {subtitle && <div className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</div>}
        </div>
        <span className="text-[9px] text-muted-foreground font-mono-hud">VIEW · {title}</span>
      </div>
      <div className="flex-1 overflow-auto p-5">{children}</div>
    </motion.div>
  );
}

export function StrategyScreen({ t }: { t: Telemetry }) {
  const stints = [
    { stint: 1, comp: "MEDIUM", laps: "1—14", deg: 62, color: "amber" },
    { stint: 2, comp: "HARD", laps: "15—32", deg: 38, color: "cyan" },
    { stint: 3, comp: "SOFT", laps: "33—57", deg: 12, color: "magenta" },
  ];
  return (
    <ScreenShell title="RACE STRATEGY" subtitle="ARES v4.2 · live re-optimization · 87% confidence" accent="magenta">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <div className="space-y-2">
            <div className="text-[10px] font-display tracking-widest text-muted-foreground">STINT PLAN</div>
            {stints.map((s) => (
              <div key={s.stint} className="rounded border border-panel-border bg-black/30 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-[11px] tracking-widest text-hud-cyan">STINT {s.stint} · {s.comp}</span>
                  <span className="text-[10px] font-mono-hud text-muted-foreground">L {s.laps}</span>
                </div>
                <div className="h-2 rounded bg-black/40 overflow-hidden">
                  <div className="h-full" style={{
                    width: `${s.deg}%`,
                    background: s.color === "amber" ? "var(--gradient-amber)" :
                                s.color === "magenta" ? "linear-gradient(90deg, oklch(0.7 0.25 330), oklch(0.85 0.18 200))" :
                                "var(--gradient-cyan)",
                  }} />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                  <span>DEG {s.deg}%</span><span>PROJ +{(s.deg / 12).toFixed(2)}s/lap</span>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded border border-hud-magenta/40 bg-hud-magenta/5 p-3">
            <div className="flex items-center gap-2 text-hud-magenta text-[10px] font-display tracking-widest mb-2">
              <Brain className="h-3 w-3" /> AI RECOMMENDATION
            </div>
            <div className="text-sm text-foreground">Box on lap <span className="text-hud-amber font-mono-hud">L31</span> for SOFT C4. Counter-pit Car #16 to defend P3.</div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-[10px]">
              <div><span className="text-muted-foreground">Win prob</span><div className="font-mono-hud text-hud-green text-base">31.4%</div></div>
              <div><span className="text-muted-foreground">Podium prob</span><div className="font-mono-hud text-hud-cyan text-base">78.9%</div></div>
              <div><span className="text-muted-foreground">DNF risk</span><div className="font-mono-hud text-hud-red text-base">3.2%</div></div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded border border-panel-border p-3">
            <div className="text-[10px] font-display tracking-widest text-muted-foreground mb-2">RIVAL TRACKER</div>
            {[
              { p: 1, n: "VERSTAPPEN", g: "—" }, { p: 2, n: "LECLERC", g: "+1.247" },
              { p: 3, n: "HAMILTON", g: "+3.812", us: true }, { p: 4, n: "NORRIS", g: "+5.301" },
              { p: 5, n: "RUSSELL", g: "+7.014" },
            ].map((d) => (
              <div key={d.p} className={cn(
                "flex items-center justify-between text-[11px] py-1 px-2 rounded",
                d.us && "bg-hud-cyan/10 border border-hud-cyan/30"
              )}>
                <span className="font-mono-hud text-muted-foreground">P{d.p}</span>
                <span className={cn("flex-1 ml-2", d.us ? "text-hud-cyan" : "text-foreground")}>{d.n}</span>
                <span className="font-mono-hud text-[10px] text-muted-foreground">{d.g}</span>
              </div>
            ))}
          </div>
          <div className="rounded border border-panel-border p-3">
            <div className="text-[10px] font-display tracking-widest text-muted-foreground mb-2">FUEL FORECAST</div>
            <MiniSpark data={t.fuelHistory} color="oklch(0.82 0.17 75)" />
            <div className="text-[10px] text-hud-amber mt-2">Margin <span className="font-mono-hud">+1.4 laps</span></div>
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

export function CrewScreen() {
  const crew = [
    { id: "FJ", name: "M. ROSSI", role: "FRONT JACK", hr: 138, status: "READY" },
    { id: "FL", name: "J. KAUR", role: "FRONT LEFT GUN", hr: 144, status: "READY" },
    { id: "FR", name: "T. NDIAYE", role: "FRONT RIGHT GUN", hr: 141, status: "READY" },
    { id: "RL", name: "L. SCHMIDT", role: "REAR LEFT GUN", hr: 152, status: "STBY" },
    { id: "RR", name: "P. TANAKA", role: "REAR RIGHT GUN", hr: 139, status: "READY" },
    { id: "RJ", name: "D. SILVA", role: "REAR JACK", hr: 147, status: "READY" },
    { id: "LO", name: "C. ANDREWS", role: "LOLLIPOP", hr: 128, status: "READY" },
  ];
  return (
    <ScreenShell title="PIT CREW" subtitle="14-member squad · biometric uplink · haptic comms armed" accent="cyan">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 grid grid-cols-2 gap-3">
          {crew.map((c) => (
            <div key={c.id} className="rounded border border-panel-border bg-black/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-display text-[10px] tracking-widest text-hud-cyan">{c.role}</div>
                  <div className="text-sm font-mono-hud">{c.name}</div>
                </div>
                <span className={cn(
                  "text-[9px] px-1.5 py-0.5 rounded border font-display tracking-widest",
                  c.status === "READY" ? "border-hud-green/40 text-hud-green bg-hud-green/10" : "border-hud-amber/40 text-hud-amber bg-hud-amber/10"
                )}>{c.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div><span className="text-muted-foreground">HR</span><div className="font-mono-hud text-hud-red">{c.hr}</div></div>
                <div><span className="text-muted-foreground">RXN</span><div className="font-mono-hud text-hud-cyan">{(0.18 + Math.random() * 0.06).toFixed(2)}s</div></div>
                <div><span className="text-muted-foreground">UPLINK</span><div className="font-mono-hud text-hud-green">OK</div></div>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="rounded border border-panel-border p-3">
            <div className="text-[10px] font-display tracking-widest text-muted-foreground mb-2">BEST PIT TIMES</div>
            {[
              { lap: "L12", t: "2.18s", us: true }, { lap: "L09 RBR", t: "2.04s" },
              { lap: "L11 FER", t: "2.31s" }, { lap: "L13 MCL", t: "2.42s" },
            ].map((r, i) => (
              <div key={i} className={cn("flex items-center justify-between text-[11px] py-1", r.us && "text-hud-amber")}>
                <span className="font-mono-hud">{r.lap}</span>
                <span className="font-mono-hud text-glow-amber">{r.t}</span>
              </div>
            ))}
          </div>
          <div className="rounded border border-hud-amber/40 bg-hud-amber/5 p-3">
            <div className="flex items-center gap-2 text-hud-amber text-[10px] font-display tracking-widest mb-2">
              <Wrench className="h-3 w-3" /> EQUIPMENT
            </div>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between"><span>Front jack pressure</span><span className="text-hud-green font-mono-hud">142 bar</span></div>
              <div className="flex justify-between"><span>Wheel guns torque</span><span className="text-hud-green font-mono-hud">3000 Nm</span></div>
              <div className="flex justify-between"><span>Fuel rig flow</span><span className="text-hud-cyan font-mono-hud">12 L/s</span></div>
              <div className="flex justify-between"><span>Tire blanket temp</span><span className="text-hud-amber font-mono-hud">92 °C</span></div>
            </div>
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

export function AnalyticsScreen({ t }: { t: Telemetry }) {
  return (
    <ScreenShell title="DEEP ANALYTICS" subtitle="lap-by-lap delta · sector trace · sensor fusion" accent="cyan">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded border border-panel-border p-3">
          <div className="flex items-center gap-2 text-[10px] font-display tracking-widest text-hud-cyan mb-2">
            <Timer className="h-3 w-3" /> LAP DELTA
          </div>
          <div className="space-y-1">
            {Array.from({ length: 8 }).map((_, i) => {
              const d = (Math.random() - 0.4) * 0.6;
              const pct = Math.min(100, Math.abs(d) * 200);
              return (
                <div key={i} className="flex items-center gap-2 text-[10px]">
                  <span className="w-8 font-mono-hud text-muted-foreground">L{28 - i}</span>
                  <div className="flex-1 h-2 bg-black/40 rounded relative overflow-hidden">
                    <div className={cn("absolute top-0 h-full", d < 0 ? "right-1/2 bg-hud-green" : "left-1/2 bg-hud-red")}
                      style={{ width: `${pct / 2}%` }} />
                    <div className="absolute left-1/2 top-0 h-full w-px bg-foreground/30" />
                  </div>
                  <span className={cn("w-12 text-right font-mono-hud", d < 0 ? "text-hud-green" : "text-hud-red")}>
                    {d > 0 ? "+" : ""}{d.toFixed(3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded border border-panel-border p-3">
          <div className="flex items-center gap-2 text-[10px] font-display tracking-widest text-hud-cyan mb-2">
            <Cpu className="h-3 w-3" /> POWER UNIT TRACE
          </div>
          <MiniSpark data={t.speedHistory} color="oklch(0.85 0.18 200)" />
          <div className="grid grid-cols-2 gap-2 mt-3">
            <BarMeter label="ICE" value={t.engine} accent="green" />
            <BarMeter label="MGU-K" value={t.ers} accent="cyan" />
            <BarMeter label="MGU-H" value={84} accent="amber" />
            <BarMeter label="BATTERY" value={t.ers * 0.9} accent="cyan" />
          </div>
        </div>
        <div className="rounded border border-panel-border p-3">
          <div className="flex items-center gap-2 text-[10px] font-display tracking-widest text-hud-cyan mb-2">
            <Thermometer className="h-3 w-3" /> THERMAL MAP
          </div>
          <div className="grid grid-cols-4 gap-2">
            {["FL", "FR", "RL", "RR"].map((k) => {
              const v = 80 + Math.random() * 30;
              return (
                <div key={k} className="rounded p-2 text-center" style={{
                  background: `linear-gradient(180deg, oklch(0.65 0.27 25 / ${v / 110}), oklch(0.82 0.17 75 / 0.2))`,
                  border: "1px solid oklch(0.82 0.17 75 / 0.4)",
                }}>
                  <div className="text-[9px] text-muted-foreground">{k}</div>
                  <div className="font-mono-hud text-sm text-hud-amber">{v.toFixed(0)}°</div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-[10px] text-muted-foreground">Brake disc avg <span className="text-hud-amber font-mono-hud">512°C</span> · target window 450—650°C</div>
        </div>
        <div className="rounded border border-panel-border p-3">
          <div className="flex items-center gap-2 text-[10px] font-display tracking-widest text-hud-cyan mb-2">
            <Wind className="h-3 w-3" /> AERO & TRACK
          </div>
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Downforce</span><span className="font-mono-hud text-hud-cyan">{t.downforce.toFixed(0)}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Drag</span><span className="font-mono-hud text-hud-cyan">38%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Aero bal</span><span className="font-mono-hud text-hud-cyan">{t.aero.toFixed(0)}% F</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Wind</span><span className="font-mono-hud text-hud-amber">12 kph SE</span></div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground"><Droplets className="h-3 w-3 inline" /> Track grip</span><span className="font-mono-hud text-hud-green">94%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Track temp</span><span className="font-mono-hud text-hud-amber">41°C</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Air temp</span><span className="font-mono-hud text-hud-cyan">28°C</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Humidity</span><span className="font-mono-hud text-hud-cyan">62%</span></div>
            </div>
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

export function ReplayScreen() {
  const incidents = [
    { l: 24, t: "T7", text: "Lock-up FL · 0.18s lost", level: "warn" },
    { l: 19, t: "T11", text: "Off-track excursion · investigation cleared", level: "alert" },
    { l: 14, t: "PIT", text: "Pit stop 2.18s — best of stint", level: "ok" },
    { l: 8, t: "T1", text: "Overtake on Car #4", level: "ok" },
    { l: 1, t: "GRID", text: "Launch +0.32s reaction", level: "ok" },
  ];
  return (
    <ScreenShell title="REPLAY & INCIDENTS" subtitle="multi-cam scrub · spatial reconstruction" accent="amber">
      <div className="grid grid-cols-3 gap-4 h-full">
        <div className="col-span-2 space-y-3">
          <div className="aspect-video rounded border border-panel-border bg-black/60 relative overflow-hidden">
            <div className="absolute inset-0 grid-floor opacity-40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 400 220" className="w-3/4">
                <path d="M40 180 Q 80 40 200 60 T 360 180" fill="none" stroke="oklch(0.85 0.18 200 / 0.7)" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="200" cy="60" r="8" fill="oklch(0.7 0.25 330)" style={{ filter: "drop-shadow(0 0 8px oklch(0.7 0.25 330))" }} />
                <text x="200" y="50" textAnchor="middle" fontSize="9" fill="oklch(0.85 0.18 200)" fontFamily="monospace">CAR #44</text>
              </svg>
            </div>
            <div className="absolute top-2 left-2 text-[10px] font-mono-hud text-hud-cyan">CAM 03 · ONBOARD</div>
            <div className="absolute bottom-2 right-2 text-[10px] font-mono-hud text-hud-amber">L24 · 00:48.221</div>
          </div>
          <div className="rounded border border-panel-border p-3">
            <div className="text-[10px] font-display tracking-widest text-muted-foreground mb-2">TIMELINE</div>
            <div className="relative h-10 bg-black/40 rounded">
              {[12, 24, 38, 51, 67, 74, 88].map((p, i) => (
                <div key={i} className="absolute top-0 h-full w-1 bg-hud-amber" style={{ left: `${p}%` }} />
              ))}
              <div className="absolute top-0 h-full w-0.5 bg-hud-cyan" style={{ left: "62%", boxShadow: "var(--shadow-hud)" }} />
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground font-mono-hud mt-1">
              <span>L1</span><span>L14</span><span>L28</span><span>L42</span><span>L57</span>
            </div>
          </div>
        </div>
        <div className="rounded border border-panel-border p-3 overflow-auto">
          <div className="text-[10px] font-display tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
            <MapPin className="h-3 w-3" /> INCIDENTS
          </div>
          <div className="space-y-1.5">
            {incidents.map((i, idx) => (
              <div key={idx} className={cn(
                "rounded border p-2 text-[11px]",
                i.level === "warn" ? "border-hud-amber/40 bg-hud-amber/5" :
                i.level === "alert" ? "border-hud-red/40 bg-hud-red/5" :
                "border-hud-green/30 bg-hud-green/5"
              )}>
                <div className="flex justify-between text-[9px] font-display tracking-widest opacity-70">
                  <span>L{i.l} · {i.t}</span><Trophy className="h-3 w-3 opacity-60" />
                </div>
                <div className="mt-0.5">{i.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

export function SettingsScreen() {
  const items = [
    { label: "Spatial anchoring", val: "WORLD-LOCKED", on: true },
    { label: "Hand tracking sensitivity", val: "HIGH", on: true },
    { label: "Voice command channel", val: "CH 1", on: true },
    { label: "Eye-focus dimming", val: "AUTO", on: true },
    { label: "Haptic strength", val: "75%", on: true },
    { label: "Passthrough opacity", val: "62%", on: false },
    { label: "Notification cluster", val: "PERIPHERAL", on: true },
    { label: "Holographic glow", val: "CINEMATIC", on: true },
  ];
  return (
    <ScreenShell title="SPATIAL SETTINGS" subtitle="MR headset · session F1-PIT-MR-0044" accent="cyan">
      <div className="grid grid-cols-2 gap-3">
        {items.map((i) => (
          <div key={i.label} className="rounded border border-panel-border bg-black/30 p-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-foreground">{i.label}</div>
              <div className="text-[9px] text-muted-foreground font-mono-hud mt-0.5">{i.val}</div>
            </div>
            <div className={cn(
              "h-5 w-9 rounded-full p-0.5 transition-colors",
              i.on ? "bg-hud-cyan/40" : "bg-black/60 border border-panel-border"
            )}>
              <div className={cn(
                "h-4 w-4 rounded-full transition-transform",
                i.on ? "translate-x-4 bg-hud-cyan shadow-[var(--shadow-hud)]" : "bg-muted-foreground"
              )} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded border border-hud-cyan/30 bg-hud-cyan/5 p-3 flex items-center gap-3">
        <Radio className="h-4 w-4 text-hud-cyan" />
        <div className="text-[11px]">
          Headset uplink stable · <span className="font-mono-hud text-hud-green">12ms</span> latency · <span className="font-mono-hud text-hud-amber">94%</span> battery
        </div>
      </div>
    </ScreenShell>
  );
}
