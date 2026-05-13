import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { AlertTriangle, Clock, Wrench, ShieldAlert } from "lucide-react";

const crew = [
  { id: "FJ", role: "FRONT JACK", status: "READY" },
  { id: "FL", role: "FRONT LEFT", status: "READY" },
  { id: "FR", role: "FRONT RIGHT", status: "READY" },
  { id: "RL", role: "REAR LEFT", status: "STBY" },
  { id: "RR", role: "REAR RIGHT", status: "READY" },
  { id: "RJ", role: "REAR JACK", status: "READY" },
  { id: "LO", role: "LOLLIPOP", status: "READY" },
];

const checklist = [
  "Tire compound: SOFT C4",
  "Front wing flap: +1",
  "Brake duct config locked",
  "Fuel rig: 28.4kg armed",
  "Crew clearance: green",
  "Pit limiter armed",
];

export function PitModeOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [count, setCount] = useState(8);
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    if (!open) { setCount(8); setDone([]); return; }
    const id = setInterval(() => setCount((c) => (c > 0 ? c - 1 : c)), 1000);
    return () => clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => {
      setDone((d) => (d.length < checklist.length ? [...d, d.length] : d));
    }, 700);
    return () => clearInterval(id);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 pointer-events-auto"
        >
          {/* Edge flashing */}
          <div className="absolute inset-0 pointer-events-none animate-hud-pulse"
            style={{ boxShadow: "inset 0 0 120px oklch(0.65 0.27 25 / 0.5)", border: "2px solid oklch(0.65 0.27 25)" }} />
          <div className="absolute inset-0 backdrop-blur-sm bg-black/40" onClick={onClose} />

          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            className="absolute inset-x-8 top-1/2 -translate-y-1/2 mx-auto max-w-5xl panel-glass corner-brackets rounded-lg"
            style={{ borderColor: "oklch(0.65 0.27 25 / 0.6)", boxShadow: "var(--shadow-danger)" }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-hud-red/30 bg-hud-red/10">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-hud-red animate-hud-pulse" />
                <div>
                  <div className="font-display tracking-[0.3em] text-hud-red text-glow-red text-sm">PIT STOP MODE — ACTIVE</div>
                  <div className="text-[10px] text-muted-foreground">Car #44 · Inbound · Box this lap</div>
                </div>
              </div>
              <button onClick={onClose} className="text-xs px-3 py-1 rounded border border-hud-red/40 text-hud-red hover:bg-hud-red/10">
                ABORT
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 p-5">
              {/* Countdown */}
              <div className="space-y-3">
                <div className="text-[10px] text-muted-foreground font-display tracking-widest">ARRIVAL</div>
                <div className="font-display text-7xl text-hud-amber text-glow-amber tabular-nums">{count.toString().padStart(2, "0")}</div>
                <div className="text-[10px] text-muted-foreground">SECONDS TO BOX</div>
                <div className="mt-4 p-3 rounded border border-hud-amber/30 bg-hud-amber/5">
                  <div className="flex items-center gap-2 text-hud-amber text-[10px] font-display tracking-widest">
                    <Wrench className="h-3 w-3" /> COMPOUND
                  </div>
                  <div className="font-display text-2xl text-hud-amber mt-1">SOFT · C4</div>
                  <div className="text-[10px] text-muted-foreground">Set #3 · Pre-heated 92°C</div>
                </div>
              </div>

              {/* Crew positions */}
              <div className="space-y-2">
                <div className="text-[10px] text-muted-foreground font-display tracking-widest">CREW STATIONS</div>
                <div className="relative aspect-[4/3] rounded border border-panel-border bg-black/40 overflow-hidden">
                  {/* Car silhouette */}
                  <svg viewBox="0 0 200 150" className="absolute inset-0 w-full h-full">
                    <rect x="70" y="40" width="60" height="70" rx="6" fill="oklch(0.2 0.03 250)" stroke="oklch(0.85 0.18 200 / 0.4)" />
                    <circle cx="70" cy="55" r="8" fill="oklch(0.1 0 0)" stroke="oklch(0.65 0.27 25)" />
                    <circle cx="130" cy="55" r="8" fill="oklch(0.1 0 0)" stroke="oklch(0.65 0.27 25)" />
                    <circle cx="70" cy="100" r="8" fill="oklch(0.1 0 0)" stroke="oklch(0.65 0.27 25)" />
                    <circle cx="130" cy="100" r="8" fill="oklch(0.1 0 0)" stroke="oklch(0.65 0.27 25)" />
                    {/* Danger zones */}
                    <rect x="50" y="0" width="100" height="20" fill="oklch(0.65 0.27 25 / 0.2)" stroke="oklch(0.65 0.27 25 / 0.5)" strokeDasharray="3 3" />
                    <rect x="50" y="130" width="100" height="20" fill="oklch(0.65 0.27 25 / 0.2)" stroke="oklch(0.65 0.27 25 / 0.5)" strokeDasharray="3 3" />
                    {/* Crew dots */}
                    {[
                      { x: 100, y: 25, l: "FJ" }, { x: 60, y: 40, l: "FL" }, { x: 140, y: 40, l: "FR" },
                      { x: 60, y: 110, l: "RL" }, { x: 140, y: 110, l: "RR" }, { x: 100, y: 130, l: "RJ" },
                      { x: 100, y: 75, l: "LO" },
                    ].map((p) => (
                      <g key={p.l}>
                        <circle cx={p.x} cy={p.y} r="6" fill="oklch(0.82 0.2 145)" style={{ filter: "drop-shadow(0 0 4px oklch(0.82 0.2 145))" }} />
                        <text x={p.x} y={p.y + 2} textAnchor="middle" fontSize="6" fill="oklch(0.1 0 0)" fontWeight="bold">{p.l}</text>
                      </g>
                    ))}
                  </svg>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {crew.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-[9px] px-1.5 py-0.5 rounded bg-black/30 border border-panel-border">
                      <span className="text-muted-foreground">{c.role}</span>
                      <span className={c.status === "READY" ? "text-hud-green" : "text-hud-amber"}>{c.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-display tracking-widest">
                  <Clock className="h-3 w-3" /> PROCEDURE
                </div>
                <div className="space-y-1.5">
                  {checklist.map((c, i) => {
                    const ok = done.includes(i);
                    return (
                      <motion.div
                        key={c}
                        initial={false}
                        animate={{ opacity: ok ? 1 : 0.5 }}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded border text-[11px] ${ok ? "border-hud-green/40 bg-hud-green/10 text-hud-green" : "border-panel-border bg-black/30 text-muted-foreground"}`}
                      >
                        <span className={`h-3 w-3 rounded-sm border ${ok ? "bg-hud-green border-hud-green" : "border-muted-foreground"}`} />
                        {c}
                      </motion.div>
                    );
                  })}
                </div>
                <div className="mt-3 p-2 rounded border border-hud-red/30 bg-hud-red/10 flex items-center gap-2 text-[10px] text-hud-red">
                  <AlertTriangle className="h-3 w-3" />
                  CLEAR DANGER ZONES BEFORE RELEASE
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
