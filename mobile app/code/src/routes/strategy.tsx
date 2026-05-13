import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Glasses, Watch, Send, BatteryFull, Signal, X, Check } from "lucide-react";
import { toast } from "sonner";
import { ActivePitStop } from "@/components/ActivePitStop";
import { haptic } from "@/lib/haptics";

type Tyre = "HARD" | "MED" | "SOFT";

export const Route = createFileRoute("/strategy")({
  head: () => ({
    meta: [
      { title: "Pit Strategy Input · Car 44" },
      { name: "description", content: "Configure tyres, fuel delta and parallel sync before sending the pit request." },
    ],
  }),
  component: StrategyPage,
});

function StrategyPage() {
  const [tyre, setTyre] = useState<Tyre>("MED");
  const [fuelSync, setFuelSync] = useState(true);
  const [watchNotif, setWatchNotif] = useState(true);
  const [pitOpen, setPitOpen] = useState(false);

  const [arConnected, setArConnected] = useState(true);
  const [watchConnected, setWatchConnected] = useState(true);

  // Approval state: pending → confirmed shortly after request sent
  const [chiefApproved, setChiefApproved] = useState(false);
  const [stratApproved, setStratApproved] = useState(false);

  const sendRequest = () => {
    haptic([30, 40, 30]);
    toast.success("PIT REQUEST SENT", { description: `${tyre} tyres · L36 · Crew armed` });
    // Reset & simulate parallel approval flow
    setChiefApproved(false);
    setStratApproved(false);
    setTimeout(() => setChiefApproved(true), 700);
    setTimeout(() => { setStratApproved(true); setPitOpen(true); }, 1500);
  };

  return (
    <AppShell>
      <PageHeader eyebrow="STRATEGY" title="PIT STRATEGY INPUT" />

      <div className="px-4 pt-4 space-y-4">
        {/* Tyre selection */}
        <section>
          <Label>TYRE COMPOUND</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {(["HARD", "MED", "SOFT"] as const).map((t) => {
              const active = tyre === t;
              const dot = t === "HARD" ? "bg-white" : t === "MED" ? "bg-yellow-400" : "bg-red-500";
              return (
                <button
                  key={t}
                  onClick={() => { haptic(10); setTyre(t); }}
                  className={`pressable min-h-[72px] rounded-lg border-2 carbon-fiber flex flex-col items-center justify-center gap-1 transition-none ${
                    active ? "border-cyan glow-cyan text-cyan" : "border-border text-muted-foreground"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${dot}`} />
                  <span className="text-sm font-bold tracking-widest">{t}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Toggles */}
        <section className="rounded-lg border border-cyan/30 carbon-fiber divide-y divide-border">
          <ToggleRow label="FUEL DELTA SYNC" desc="Auto-match plan ±0.2kg" value={fuelSync} onChange={setFuelSync} />
          <ToggleRow label="WATCH NOTIFICATION" desc="Buzz crew smartwatches" value={watchNotif} onChange={setWatchNotif} />
        </section>

        {/* Parallel Sync */}
        <section className="rounded-lg border border-cyan/30 carbon-fiber p-3">
          <Label>PARALLEL SYNC</Label>
          <div className="mt-2 space-y-2">
            <DeviceRow
              icon={Glasses}
              label="AR Glasses"
              connected={arConnected}
              battery={84}
              signal={4}
              onToggle={() => { haptic(15); setArConnected((v) => !v); }}
            />
            <DeviceRow
              icon={Watch}
              label="Smartwatch"
              connected={watchConnected}
              battery={62}
              signal={3}
              onToggle={() => { haptic(15); setWatchConnected((v) => !v); }}
            />
          </div>
        </section>

        {/* Approval status */}
        <section className="rounded-lg border border-cyan/30 carbon-fiber p-3">
          <Label>APPROVAL STATUS</Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <ApprovalBadge name="Pit Chief" approved={chiefApproved} />
            <ApprovalBadge name="Strategist" approved={stratApproved} />
          </div>
        </section>

        {/* Lap target */}
        <section className="rounded-lg border border-cyan/30 carbon-fiber p-3">
          <Label>TARGET PIT LAP</Label>
          <div className="mt-2 grid grid-cols-5 gap-1">
            {[35, 36, 37, 38, 39].map((l, i) => (
              <button
                key={l}
                onClick={() => haptic(8)}
                className={`pressable min-h-[48px] rounded border ${i === 1 ? "border-cyan text-cyan glow-cyan" : "border-border text-muted-foreground"} font-bold`}
              >
                L{l}
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={sendRequest}
          className="pressable w-full min-h-[64px] rounded-lg bg-racing-red text-white text-lg tracking-[0.25em] font-bold flex items-center justify-center gap-2 glow-red transition-none"
        >
          <Send size={20} /> CONFIRM &amp; SEND REQUEST
        </button>
      </div>

      {pitOpen && <ActivePitStop onClose={() => setPitOpen(false)} />}
    </AppShell>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] tracking-[0.3em] text-cyan">{children}</div>;
}

function ToggleRow({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => { haptic(10); onChange(!value); }} className="pressable w-full min-h-[64px] flex items-center justify-between px-4 py-3 text-left transition-none">
      <div>
        <div className="text-sm font-bold tracking-widest">{label}</div>
        <div className="text-[10px] text-muted-foreground">{desc}</div>
      </div>
      <div className={`w-14 h-8 rounded-full p-1 flex items-center transition-none ${value ? "bg-cyan justify-end glow-cyan" : "bg-border justify-start"}`}>
        <span className={`w-6 h-6 rounded-full ${value ? "bg-primary-foreground" : "bg-foreground/60"}`} />
      </div>
    </button>
  );
}

function DeviceRow({
  icon: Icon, label, connected, battery, signal, onToggle,
}: {
  icon: any; label: string; connected: boolean; battery: number; signal: 1 | 2 | 3 | 4; onToggle: () => void;
}) {
  const battColor = battery > 50 ? "var(--color-success)" : battery > 20 ? "oklch(0.85 0.18 90)" : "var(--color-racing-red)";
  return (
    <div className={`rounded border ${connected ? "border-border" : "border-racing-red/40"} px-3 py-2 flex items-center justify-between`}>
      <div className="flex items-center gap-3 min-w-0">
        <Icon size={18} className={connected ? "text-cyan" : "text-muted-foreground"} />
        <div className="min-w-0">
          <div className="text-sm font-bold truncate">{label}</div>
          <div className="text-[10px] text-muted-foreground tracking-widest">
            {connected ? "CONNECTED · 5.8GHz" : "DISCONNECTED"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {connected ? (
          <>
            {/* Signal bars */}
            <div className="flex items-end gap-[2px] h-4" title={`Signal ${signal}/4`}>
              {[1, 2, 3, 4].map((b) => (
                <span
                  key={b}
                  className="w-[3px] rounded-sm"
                  style={{
                    height: `${b * 25}%`,
                    backgroundColor: b <= signal ? "var(--color-cyan)" : "var(--color-border)",
                  }}
                />
              ))}
            </div>
            {/* Battery */}
            <div className="flex items-center gap-1">
              <BatteryFull size={14} style={{ color: battColor }} />
              <span className="text-[10px] font-bold tabular-nums" style={{ color: battColor }}>{battery}%</span>
            </div>
            <button
              onClick={onToggle}
              className="pressable text-[10px] tracking-widest text-racing-red border border-racing-red/60 px-2 py-1 rounded font-bold flex items-center gap-1"
            >
              <X size={10} /> DISCONNECT
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
            className="pressable text-[10px] tracking-widest text-cyan border border-cyan/60 px-2 py-1 rounded font-bold flex items-center gap-1"
          >
            <Signal size={10} /> CONNECT
          </button>
        )}
      </div>
    </div>
  );
}

function ApprovalBadge({ name, approved }: { name: string; approved: boolean }) {
  return (
    <div
      className={`rounded-lg border-2 px-3 py-2 flex items-center gap-2 ${
        approved ? "border-[var(--color-success)]" : "border-border"
      }`}
      style={approved ? { boxShadow: "0 0 12px color-mix(in oklab, var(--color-success) 40%, transparent)" } : undefined}
    >
      <span
        className={`w-3 h-3 rounded-full ${approved ? "" : "bg-muted blink"}`}
        style={approved ? { backgroundColor: "var(--color-success)", boxShadow: "0 0 10px var(--color-success)" } : undefined}
      />
      <div className="flex-1">
        <div className="text-[10px] tracking-[0.25em] text-muted-foreground">{name.toUpperCase()}</div>
        <div className={`text-xs font-bold tracking-widest flex items-center gap-1 ${approved ? "text-[var(--color-success)]" : "text-muted-foreground"}`}>
          {approved ? <><Check size={12} /> CONFIRMED</> : "PENDING…"}
        </div>
      </div>
    </div>
  );
}
