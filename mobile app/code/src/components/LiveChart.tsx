import { useEffect, useState } from "react";

type Props = {
  label: string;
  unit: string;
  color: string;
  min: number;
  max: number;
  generator: (t: number, prev: number) => number;
};

export function LiveChart({ label, unit, color, min, max, generator }: Props) {
  const [data, setData] = useState<number[]>(() =>
    Array.from({ length: 40 }, (_, i) => (min + max) / 2 + Math.sin(i / 3) * (max - min) * 0.2)
  );

  useEffect(() => {
    let t = 0;
    const id = setInterval(() => {
      t += 1;
      setData((prev) => {
        const next = generator(t, prev[prev.length - 1]);
        const clamped = Math.max(min, Math.min(max, next));
        return [...prev.slice(1), clamped];
      });
    }, 180);
    return () => clearInterval(id);
  }, [generator, min, max]);

  const w = 320, h = 90;
  const stepX = w / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = h - ((v - min) / (max - min)) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const last = data[data.length - 1];

  return (
    <div className="rounded-lg border border-cyan/30 carbon-fiber p-3">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[10px] tracking-[0.25em] text-muted-foreground">{label}</span>
        <span className="text-lg font-bold" style={{ color }}>
          {last.toFixed(1)} <span className="text-[10px] text-muted-foreground">{unit}</span>
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20">
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((p) => (
          <line key={p} x1="0" x2={w} y1={h * p} y2={h * p} stroke="oklch(0.86 0.18 200)" strokeOpacity="0.08" />
        ))}
        <polyline points={`0,${h} ${points} ${w},${h}`} fill={`url(#grad-${label})`} stroke="none" />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: "all 0.18s linear" }}
        />
      </svg>
    </div>
  );
}
