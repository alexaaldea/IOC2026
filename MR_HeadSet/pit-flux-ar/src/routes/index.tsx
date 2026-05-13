import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity, AlertTriangle, Brain, Cloud, Flag, Fuel, Gauge,
  Mic, MicOff, Radio, Settings2, Sparkles, Wifi, Hand, Eye, Heart, Watch,
} from "lucide-react";
import { HoloPanel } from "@/components/mr/HoloPanel";
import {
  TireGrid, BrakeGrid, RadialGauge, GearIndicator, BarMeter, MiniSpark,
} from "@/components/mr/Telemetry";
import { DriverStream } from "@/components/mr/DriverStream";
import { PitModeOverlay } from "@/components/mr/PitModeOverlay";
import {
  useTelemetry, useRaceState, useAIFeed, useRadioFeed, useSpatialNotifications,
} from "@/components/mr/hooks";
import { cn } from "@/lib/utils";
import {
  ScreenSwitcher, StrategyScreen, CrewScreen, AnalyticsScreen, ReplayScreen, SettingsScreen,
  type ScreenMode,
} from "@/components/mr/Screens";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "F1-PIT MR — Pit Engineer HUD" },
      { name: "description", content: "Mixed reality command center for Formula 1 pit-stop engineers — live telemetry, AI strategy, driver stream, and spatial controls." },
      { property: "og:title", content: "F1-PIT MR — Pit Engineer HUD" },
      { property: "og:description", content: "A futuristic AR headset interface for F1 pit-stop crews. Spatial telemetry, holographic panels, AI race strategy." },
    ],
  }),
  component: Index,
});

const voiceCommands = [
  '"Open telemetry"', '"Focus driver cam"', '"Show tire degradation"',
  '"Activate pit mode"', '"Hide strategy panel"', '"Mute channel 2"',
];

function Index() {
  const t = useTelemetry();
  const [race] = useRaceState();
  const ai = useAIFeed();
  const radio = useRadioFeed();
  const notifs = useSpatialNotifications();
  const [pit, setPit] = useState(false);
  const [muted, setMuted] = useState(false);
  const [voiceIdx, setVoiceIdx] = useState(0);
  const [mode, setMode] = useState<ScreenMode>("race");

  useEffect(() => {
    const id = setInterval(() => setVoiceIdx((i) => (i + 1) % voiceCommands.length), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Spatial environment */}
      <div className="absolute inset-0 grid-floor opacity-60" />
      <div className="absolute inset-0 scanlines opacity-40 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 40% at 50% 50%, transparent 30%, oklch(0.05 0.02 250 / 0.7) 100%)"
      }} />
      {/* Ambient orbs */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--gradient-cyan)" }} />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gradient-amber)" }} />

      {/* TOP STATUS BAR */}
      <header className="absolute top-3 left-3 right-3 z-20 panel-glass rounded-md px-4 py-2 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-sm border border-hud-cyan/50 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-hud-cyan" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-[11px] tracking-[0.3em] text-hud-cyan text-glow-cyan">F1-PIT · MR</div>
            <div className="text-[9px] text-muted-foreground">CMD CENTER · GP MONACO</div>
          </div>
        </div>

        <div className="h-8 w-px bg-panel-border" />

        <Stat label="LAP" value={`${race.lap}/${race.totalLaps}`} accent="cyan" />
        <Stat label="POS" value={`P${race.position}`} accent="amber" />
        <Stat label="GAP +" value={race.gapAhead} mono />
        <Stat label="GAP −" value={race.gapBehind} mono />
        <Stat label="LAST" value={race.lastLap} mono />
        <Stat label="BEST" value={race.bestLap} mono accent="magenta" />

        <div className="h-8 w-px bg-panel-border" />

        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4 text-hud-green" />
          <span className="text-[10px] font-display tracking-widest text-hud-green">GREEN</span>
        </div>
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-hud-cyan" />
          <span className="text-[10px] text-muted-foreground">{race.weather.condition} · Air {race.weather.temp}° · Track {race.weather.track}° · Rain {race.weather.rain.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Fuel className="h-4 w-4 text-hud-amber" />
          <span className="text-[10px] font-mono-hud text-hud-amber">{t.fuel.toFixed(1)}kg</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setPit((v) => !v)}
            className="px-3 py-1.5 rounded text-[10px] font-display tracking-[0.25em] border border-hud-red/50 text-hud-red bg-hud-red/10 hover:bg-hud-red/20 transition-colors animate-flicker"
          >
            ⚠ ACTIVATE PIT MODE
          </button>
          <div className="flex items-center gap-1.5 text-[10px] text-hud-green">
            <Wifi className="h-3 w-3" /> <span>UPLINK 12ms</span>
          </div>
        </div>
      </header>

      {/* SCREEN SWITCHER */}
      <div className="absolute top-[60px] left-1/2 -translate-x-1/2 z-20">
        <ScreenSwitcher mode={mode} onChange={setMode} />
      </div>

      {/* ALTERNATE SCREENS */}
      {mode === "strategy" && <StrategyScreen t={t} />}
      {mode === "crew" && <CrewScreen />}
      {mode === "analytics" && <AnalyticsScreen t={t} />}
      {mode === "replay" && <ReplayScreen />}
      {mode === "settings" && <SettingsScreen />}

      {mode === "race" && <>
      {/* TELEMETRY LEFT — RPM + GEAR + SPEED gauges */}
      <HoloPanel title="POWER UNIT" subtitle="MGU-K · ICE" accent="cyan" initial={{ x: 16, y: 84 }} width={260}>
        <div className="flex items-center justify-around">
          <RadialGauge value={t.rpm} max={15000} label="RPM" unit="x1k" accent="amber" size={120} />
          <GearIndicator gear={t.gear} drs={t.drs} />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <BarMeter label="ERS" value={t.ers} accent="cyan" />
          <BarMeter label="ENGINE" value={t.engine} accent="green" />
          <BarMeter label="DOWNFORCE" value={t.downforce} accent="amber" />
          <BarMeter label="AERO BAL" value={t.aero} accent="cyan" unit="%F" />
        </div>
      </HoloPanel>

      <HoloPanel title="TIRE SYSTEM" subtitle="C4 · STINT 2" accent="amber" initial={{ x: 16, y: 420 }} width={260} badge="CRIT">
        <TireGrid tires={t.tires} wear={t.tireWear} />
        <div className="mt-3">
          <div className="text-[10px] text-muted-foreground font-display tracking-widest mb-1">BRAKE TEMPS</div>
          <BrakeGrid brakes={t.brakes} />
        </div>
      </HoloPanel>

      {/* DRIVER STREAM CENTER */}
      <div className="absolute left-1/2 top-[88px] -translate-x-1/2 panel-glass corner-brackets rounded-md overflow-hidden"
        style={{ width: "min(640px, 44vw)", height: "min(380px, 46vh)" }}>
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-panel-border">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-hud-red animate-hud-pulse" />
            <span className="font-display text-[10px] tracking-[0.25em] text-hud-cyan">DRIVER FEED · #44 HAMILTON</span>
          </div>
          <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
            <Eye className="h-3 w-3" /> EYE FOCUS · 4K · HDR
          </div>
        </div>
        <div className="relative" style={{ height: "calc(100% - 32px)" }}>
          <DriverStream t={t} />
        </div>
      </div>

      {/* BOTTOM CRITICAL STRIP */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 panel-glass rounded-md px-5 py-2.5 flex items-center gap-6 z-20">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-hud-cyan" />
          <span className="text-[10px] text-muted-foreground font-display tracking-widest">SECTORS</span>
        </div>
        {(["s1", "s2", "s3"] as const).map((s, i) => (
          <div key={s} className="flex items-baseline gap-1.5">
            <span className="text-[9px] text-muted-foreground">S{i + 1}</span>
            <span className={cn("font-mono-hud text-sm", i === 1 ? "text-hud-magenta text-glow-cyan" : "text-hud-green")}>
              {race.sectors[s].toFixed(3)}
            </span>
          </div>
        ))}
        <div className="h-6 w-px bg-panel-border" />
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "px-2 py-0.5 rounded text-[9px] font-display tracking-widest border",
            t.drs ? "border-hud-green/50 text-hud-green bg-hud-green/10" : "border-panel-border text-muted-foreground"
          )}>DRS</span>
          <span className="px-2 py-0.5 rounded text-[9px] font-display tracking-widest border border-hud-amber/40 text-hud-amber bg-hud-amber/10">
            OVERTAKE
          </span>
        </div>
        <div className="h-6 w-px bg-panel-border" />
        <div className="text-[10px] text-muted-foreground">
          PIT WINDOW <span className="text-hud-amber font-mono-hud">L30—L32</span>
        </div>
      </div>

      {/* AI STRATEGY RIGHT TOP */}
      <HoloPanel title="STRATEGIST AI" subtitle="ARES v4.2" accent="magenta" initial={{ x: typeof window !== "undefined" ? window.innerWidth - 340 : 1200, y: 84 }} width={320} badge="LIVE">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Brain className="h-3 w-3 text-hud-magenta" />
            <span>Predictive model · 87% confidence</span>
          </div>
          <div className="space-y-1.5 max-h-[260px] overflow-hidden">
            <AnimatePresence initial={false}>
              {ai.map((m, i) => (
                <motion.div
                  key={m.text + i}
                  initial={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  className={cn(
                    "rounded border p-2 text-[11px] leading-snug",
                    m.level === "alert" ? "border-hud-red/40 bg-hud-red/10 text-hud-red" :
                    m.level === "warn" ? "border-hud-amber/40 bg-hud-amber/10 text-hud-amber" :
                    "border-hud-magenta/30 bg-hud-magenta/5 text-foreground"
                  )}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] font-display tracking-widest opacity-70">{m.tag}</span>
                    <span className="text-[9px] opacity-60">L{race.lap}</span>
                  </div>
                  {m.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </HoloPanel>

      {/* TEAM RADIO RIGHT BOTTOM */}
      <HoloPanel
        title="TEAM RADIO" subtitle="CH 1 · ENGINEER" accent="green"
        initial={{ x: typeof window !== "undefined" ? window.innerWidth - 340 : 1200, y: 430 }}
        width={320}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Radio className="h-3 w-3 text-hud-green" />
              <span>3 channels open</span>
            </div>
            <button onClick={() => setMuted((m) => !m)} className={cn(
              "p-1 rounded border",
              muted ? "border-hud-red/40 text-hud-red bg-hud-red/10" : "border-panel-border text-muted-foreground"
            )}>
              {muted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
            </button>
          </div>
          <div className="space-y-1.5 max-h-[220px] overflow-hidden">
            {radio.map((m, i) => (
              <div key={m.text + i} className={cn(
                "rounded border px-2 py-1.5 text-[11px]",
                m.priority === "high" ? "border-hud-amber/40 bg-hud-amber/5" : "border-panel-border bg-black/20"
              )}>
                <div className="flex items-center justify-between text-[9px] mb-0.5">
                  <span className={cn("font-display tracking-widest", m.priority === "high" ? "text-hud-amber" : "text-hud-cyan")}>
                    {m.from}
                  </span>
                  <span className="text-muted-foreground">{m.time}</span>
                </div>
                <div className="text-foreground/90">{m.text}</div>
                {i === 0 && (
                  <div className="mt-1 flex items-end gap-px h-3">
                    {Array.from({ length: 32 }).map((_, b) => (
                      <span key={b} className="w-0.5 bg-hud-green animate-hud-pulse"
                        style={{
                          height: `${20 + Math.sin(b + i) * 60 + Math.random() * 30}%`,
                          animationDelay: `${b * 30}ms`,
                          opacity: 0.6 + Math.random() * 0.4,
                        }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 pt-1">
            {["COPY", "BOX", "PUSH", "HOLD"].map((q) => (
              <button key={q} className="flex-1 text-[9px] font-display tracking-widest py-1 rounded border border-panel-border hover:border-hud-cyan/50 hover:text-hud-cyan transition-colors text-muted-foreground">
                {q}
              </button>
            ))}
          </div>
        </div>
      </HoloPanel>

      {/* FUEL HISTORY MINI PANEL bottom-left */}
      <HoloPanel title="FUEL & PACE" accent="cyan" initial={{ x: 16, y: typeof window !== "undefined" ? window.innerHeight - 200 : 600 }} width={260}>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground font-display tracking-widest">FUEL kg</span>
            <span className="font-mono-hud text-hud-amber">{t.fuel.toFixed(2)}</span>
          </div>
          <MiniSpark data={t.fuelHistory} color="oklch(0.82 0.17 75)" />
          <div className="flex items-center justify-between text-[10px] mt-2">
            <span className="text-muted-foreground font-display tracking-widest">SPEED kph</span>
            <span className="font-mono-hud text-hud-cyan">{t.speed.toFixed(0)}</span>
          </div>
          <MiniSpark data={t.speedHistory} color="oklch(0.85 0.18 200)" />
        </div>
      </HoloPanel>
      </>}

      {/* SMARTWATCH WIDGET */}
      <div className="absolute bottom-20 right-3 z-20 panel-glass rounded-md p-3 w-[200px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[10px] text-hud-cyan">
            <Watch className="h-3 w-3" />
            <span className="font-display tracking-widest">CREW WATCH</span>
          </div>
          <span className="text-[8px] text-hud-green">SYNCED</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Heart className="h-3 w-3 text-hud-red animate-hud-pulse" />
              <span className="text-[10px] text-muted-foreground">HR</span>
            </div>
            <span className="font-mono-hud text-hud-red text-sm">142 bpm</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">PIT SYNC</span>
            <span className="font-mono-hud text-hud-amber text-sm">L30 · 02:14</span>
          </div>
          <div className="text-[9px] text-muted-foreground border-t border-panel-border pt-1.5">
            Haptic alerts: <span className="text-hud-green">ARMED</span>
          </div>
        </div>
      </div>

      {/* SPATIAL NOTIFICATIONS */}
      <AnimatePresence>
        {notifs.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, scale: 0.7, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.4 }}
            className={cn(
              "absolute z-30 panel-glass rounded p-2.5 w-[230px] pointer-events-none",
              n.type === "danger" && "border-hud-red/50",
              n.type === "alert" && "border-hud-magenta/50",
              n.type === "warning" && "border-hud-amber/50",
            )}
            style={{
              left: `${n.x}%`, top: `${n.y}%`,
              boxShadow: n.type === "danger" ? "var(--shadow-danger)" :
                         n.type === "warning" ? "var(--shadow-amber)" : "var(--shadow-hud)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className={cn(
                "h-3 w-3",
                n.type === "danger" ? "text-hud-red animate-hud-pulse" :
                n.type === "warning" ? "text-hud-amber" : "text-hud-cyan"
              )} />
              <span className={cn(
                "font-display text-[10px] tracking-[0.2em]",
                n.type === "danger" ? "text-hud-red text-glow-red" :
                n.type === "warning" ? "text-hud-amber text-glow-amber" : "text-hud-cyan"
              )}>{n.title}</span>
            </div>
            <div className="text-[10px] text-foreground/80 leading-snug">{n.body}</div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* GESTURE / VOICE BAR */}
      <div className="absolute bottom-3 right-3 z-20 panel-glass rounded-md px-3 py-2 flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Hand className="h-3 w-3 text-hud-cyan" />
          <span>Pinch</span>
          <span className="text-foreground/40">·</span>
          <span>Grab</span>
          <span className="text-foreground/40">·</span>
          <span>Air-tap</span>
        </div>
        <div className="h-5 w-px bg-panel-border" />
        <div className="flex items-center gap-1.5">
          <Mic className="h-3 w-3 text-hud-green animate-hud-pulse" />
          <AnimatePresence mode="wait">
            <motion.span
              key={voiceIdx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-[10px] text-hud-green font-mono-hud"
            >
              {voiceCommands[voiceIdx]}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="h-5 w-px bg-panel-border" />
        <button className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-hud-cyan">
          <Settings2 className="h-3 w-3" /> SPATIAL
        </button>
      </div>

      <PitModeOverlay open={pit} onClose={() => setPit(false)} />
    </main>
  );
}

function Stat({ label, value, accent, mono }: { label: string; value: string; accent?: "cyan" | "amber" | "magenta"; mono?: boolean }) {
  const c = accent === "amber" ? "text-hud-amber" : accent === "magenta" ? "text-hud-magenta" : "text-foreground";
  return (
    <div className="flex flex-col leading-none">
      <span className="text-[9px] text-muted-foreground font-display tracking-widest">{label}</span>
      <span className={cn("text-sm mt-0.5", mono && "font-mono-hud", c)}>{value}</span>
    </div>
  );
}
