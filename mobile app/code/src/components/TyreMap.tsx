import { LedGauge } from "./LedGauge";

type Tyre = { id: string; label: string; temp: number; hot?: boolean };

const tyres: Tyre[] = [
  { id: "FL", label: "FRONT LEFT", temp: 102 },
  { id: "FR", label: "FRONT RIGHT", temp: 99 },
  { id: "RL", label: "REAR LEFT", temp: 138, hot: true },
  { id: "RR", label: "REAR RIGHT", temp: 108 },
];

// Optimal window 80-115°C, warn 115-130, red >130
function tempTone(t: number): "mint" | "warn" | "red" {
  if (t >= 130) return "red";
  if (t >= 115) return "warn";
  return "mint";
}

export function TyreMap() {
  return (
    <div className="border border-border p-4" style={{ borderRadius: 6 }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] tracking-[0.3em] text-mint">THERMAL TYRE MAP</span>
        <span className="text-[10px] text-muted-foreground">°C · LED SEGMENT</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {tyres.map((t) => <TyreCell key={t.id} t={t} />)}
      </div>
      <div className="mt-3 flex items-center gap-3 text-[9px] tracking-widest text-muted-foreground">
        <Legend color="var(--color-mint)" label="OPTIMAL" />
        <Legend color="var(--color-warn)" label="HIGH" />
        <Legend color="var(--color-racing-red)" label="CRITICAL" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-block w-2.5 h-2.5" style={{ background: color, borderRadius: 1 }} />
      {label}
    </span>
  );
}

function TyreCell({ t }: { t: Tyre }) {
  const tone = tempTone(t.temp);
  const color =
    tone === "red" ? "var(--color-racing-red)" :
    tone === "warn" ? "var(--color-warn)" : "var(--color-mint)";
  return (
    <div className="border border-border p-2 flex items-center gap-2" style={{ borderRadius: 6 }}>
      <div className="h-20 w-4">
        <LedGauge
          value={Math.min(160, t.temp)}
          max={160}
          segments={14}
          tone={tone}
          orientation="vertical"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-[9px] tracking-[0.2em] ${tone === "red" ? "text-racing-red" : "text-muted-foreground"}`}>
          {t.label}
        </div>
        <div className="text-xl font-bold leading-none mt-1" style={{ color }}>
          {t.temp}<span className="text-[10px] text-muted-foreground">°C</span>
        </div>
        {t.hot && (
          <div className="text-[9px] tracking-[0.2em] text-racing-red blink mt-1 font-bold">
            ● OVERHEAT
          </div>
        )}
      </div>
    </div>
  );
}
