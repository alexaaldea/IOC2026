import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { LiveChart } from "@/components/LiveChart";
import { TyreMap } from "@/components/TyreMap";
import { SyncButton } from "@/components/SyncButton";
import { Glasses, Camera, Radio } from "lucide-react";
import { haptic } from "@/lib/haptics";
import povImage from "@/assets/driver-pov.jpg";

export const Route = createFileRoute("/telemetry")({
  head: () => ({
    meta: [
      { title: "Live Telemetry · Car 44" },
      { name: "description", content: "Real-time speed, G-force, thermal tyre map and helmet-cam driver POV feed." },
    ],
  }),
  component: TelemetryPage,
});

function TelemetryPage() {
  const [pov, setPov] = useState(false);

  return (
    <AppShell>
      <PageHeader eyebrow="TELEMETRY" title="LIVE FEED" status="240Hz" />

      <div className="px-4 pt-4 space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <LiveChart
            label="SPEED"
            unit="km/h"
            color="var(--color-mint)"
            min={60}
            max={340}
            generator={(t, prev) => prev + (Math.sin(t / 4) * 18) + (Math.random() - 0.5) * 12}
          />
          <LiveChart
            label="G-FORCE"
            unit="G"
            color="var(--color-warn)"
            min={-4}
            max={5}
            generator={(t) => Math.sin(t / 3) * 3.2 + Math.cos(t / 2) * 1.1 + (Math.random() - 0.5) * 0.4}
          />
        </div>

        {pov ? <DriverPOV onClose={() => setPov(false)} /> : <TyreMap />}

        <button
          onClick={() => { haptic(15); setPov((p) => !p); }}
          className="pressable w-full min-h-[52px] rounded-lg border border-cyan/60 text-cyan tracking-[0.2em] font-bold flex items-center justify-center gap-2 hover:bg-cyan/10 transition-none"
        >
          <Camera size={18} /> {pov ? "BACK TO TYRE MAP" : "SWITCH TO HELMET CAM"}
        </button>

        <SyncButton
          idleLabel="SYNC AR GLASSES"
          loadingLabel="PUSHING TELEMETRY TO AR…"
          syncedLabel="AR GLASSES SYNCED"
          icon={<Glasses size={20} />}
          toastTitle="AR GLASSES SYNCED"
          toastDesc="HUD overlay streaming · 60fps"
        />

        <Link
          to="/strategy"
          onClick={() => haptic([20, 30, 20])}
          className="pressable block text-center min-h-[64px] py-5 rounded-lg bg-racing-red text-white tracking-[0.25em] text-lg font-bold glow-red transition-none"
        >
          REQUEST PIT STOP
        </Link>
      </div>
    </AppShell>
  );
}

function DriverPOV({ onClose }: { onClose: () => void }) {
  return (
    <div className="relative video-grain rounded-lg border border-cyan/40 overflow-hidden h-64 bg-black">
      {/* Real helmet-cam feed */}
      <img
        src={povImage}
        alt="Live driver POV helmet camera feed"
        loading="lazy"
        width={1024}
        height={640}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "saturate(0.6) contrast(1.05) brightness(0.85)" }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)" }} />
      {/* Subtle scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{
        backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0 1px, transparent 1px 3px)",
      }} />

      {/* HUD overlay */}
      <div className="absolute inset-0 p-3 flex flex-col justify-between text-cyan font-mono">
        <div className="flex justify-between items-center text-[10px] tracking-[0.25em]">
          <span className="flex items-center gap-1 px-2 py-0.5 bg-black/60 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-racing-red blink" /> REC · HELMET CAM 01
          </span>
          <button onClick={onClose} className="pressable border border-cyan/60 bg-black/60 px-2 py-1 rounded text-cyan">CLOSE</button>
        </div>

        {/* Crosshair / focus */}
        <div className="self-center">
          <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-70">
            <circle cx="40" cy="40" r="22" fill="none" stroke="var(--color-cyan)" strokeWidth="1" strokeDasharray="3 4" />
            <line x1="40" y1="10" x2="40" y2="22" stroke="var(--color-cyan)" />
            <line x1="40" y1="58" x2="40" y2="70" stroke="var(--color-cyan)" />
            <line x1="10" y1="40" x2="22" y2="40" stroke="var(--color-cyan)" />
            <line x1="58" y1="40" x2="70" y2="40" stroke="var(--color-cyan)" />
          </svg>
        </div>

        <div className="flex items-end justify-between">
          <div className="bg-black/60 px-2 py-1 rounded">
            <div className="text-[9px] tracking-[0.3em] opacity-80">GEAR</div>
            <div className="text-3xl text-white font-bold leading-none">7</div>
          </div>
          <div className="text-center bg-black/60 px-3 py-1 rounded">
            <div className="text-4xl font-bold text-white drop-shadow-[0_0_8px_var(--color-cyan)] leading-none">312</div>
            <div className="text-[9px] tracking-[0.3em] mt-1">KM/H · DRS <span className="text-white">OPEN</span></div>
          </div>
          <div className="bg-black/60 px-2 py-1 rounded text-right">
            <div className="text-[9px] tracking-[0.3em] opacity-80">B-BIAS</div>
            <div className="text-lg text-white font-bold leading-none">56.2%</div>
          </div>
        </div>
      </div>
      <div className="absolute top-10 right-3 flex items-center gap-1 text-[9px] text-cyan bg-black/60 px-2 py-0.5 rounded">
        <Radio size={10} className="blink" /> 5.8GHz · 0ms
      </div>
    </div>
  );
}
