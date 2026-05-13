import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { F1Car3D } from "@/components/F1Car3D";
import { LedGauge } from "@/components/LedGauge";
import { AlertTriangle, Fuel, Timer, Flag, Zap, ChevronRight } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { useRaceState } from "@/lib/raceState";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Team Hub · CAR 44 Live Status" },
      { name: "description", content: "Live status hub for Car 44: critical alerts, telemetry overview and race state." },
    ],
  }),
  component: HubPage,
});

function HubPage() {
  const navigate = useNavigate();
  const raceState = useRaceState();
  const caution = raceState === "SAFETY CAR";
  return (
    <AppShell>
      <PageHeader eyebrow="TEAM HUB" title="CAR 44 — LIVE STATUS" status="LIVE" />

      <div className="px-4 pt-4 space-y-4">
        {/* Critical Alert Banner */}
        <button
          onClick={() => { haptic([20, 30, 60]); navigate({ to: "/telemetry" }); }}
          className={`w-full min-h-[60px] flex items-center gap-3 px-4 py-3 border text-left active:scale-[0.99] transition-none ${
            caution ? "border-warn pulse-yellow" : "border-racing-red pulse-red"
          }`}
          style={{ borderRadius: 6 }}
        >
          <AlertTriangle className={`shrink-0 ${caution ? "text-warn" : "text-racing-red"}`} size={26} />
          <div className="flex-1">
            <div className={`text-[10px] tracking-[0.25em] font-bold ${caution ? "text-warn" : "text-racing-red"}`}>
              {caution ? "TRACK CAUTION" : "CRITICAL ALERT"}
            </div>
            <div className="text-sm font-bold tracking-wide">
              {caution ? "SAFETY CAR DEPLOYED — HOLD POSITION" : "REAR-LEFT TYRE OVERHEAT — 138°C"}
            </div>
          </div>
          <ChevronRight className={caution ? "text-warn" : "text-racing-red"} />
        </button>

        {/* 3D F1 model — drag to rotate */}
        <F1Car3D hotTyre="RL" hotTemp={138} />

        {/* Stat row */}
        <div className="grid grid-cols-3 gap-2">
          <Stat label="LAP" value="34/57" />
          <Stat label="POS" value="P3" accent />
          <Stat label="GAP" value="+1.842" />
        </div>

        {/* Fuel + ERS LED bars */}
        <div className="border border-border p-3 space-y-3" style={{ borderRadius: 6 }}>
          <LedRow icon={Fuel} label="FUEL" value={42.1} max={110} unit="kg" sub="−1.6 vs plan" tone="warn" />
          <LedRow icon={Zap}  label="ERS"  value={78}   max={100} unit="%"  sub="Deploy: HOTLAP" tone="mint" />
        </div>

        {/* Info row */}
        <div className="grid grid-cols-2 gap-2">
          <InfoCard icon={Timer} label="LAST LAP" value="1:28.412" sub="P2 sector best" />
          <InfoCard icon={Flag}  label="STRATEGY" value="2-STOP"  sub="Pit window 36–39" />
        </div>

        <Link
          to="/strategy"
          onClick={() => haptic(15)}
          className="pressable block text-center min-h-[52px] py-4 border border-mint text-mint tracking-[0.25em] font-bold hover:bg-mint/10 transition-none"
          style={{ borderRadius: 6 }}
        >
          OPEN STRATEGY ›
        </Link>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border border-border px-3 py-3 text-center" style={{ borderRadius: 6 }}>
      <div className="text-[9px] tracking-[0.25em] text-muted-foreground">{label}</div>
      <div className={`text-lg font-bold ${accent ? "text-mint" : ""}`}>{value}</div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub: string }) {
  return (
    <div className="border border-border p-3" style={{ borderRadius: 6 }}>
      <div className="flex items-center gap-2 text-mint">
        <Icon size={14} />
        <span className="text-[10px] tracking-[0.25em]">{label}</span>
      </div>
      <div className="mt-1 text-lg font-bold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function LedRow({ icon: Icon, label, value, max, unit, sub, tone }:
  { icon: any; label: string; value: number; max: number; unit: string; sub: string; tone?: "mint" | "warn" | "red" }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 text-mint">
          <Icon size={14} />
          <span className="text-[10px] tracking-[0.25em]">{label}</span>
        </div>
        <div className="text-sm font-bold tabular-nums">
          {value}<span className="text-[10px] text-muted-foreground ml-1">{unit}</span>
        </div>
      </div>
      <div className="h-3">
        <LedGauge value={value} max={max} segments={20} tone={tone} />
      </div>
      <div className="text-[10px] text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}
