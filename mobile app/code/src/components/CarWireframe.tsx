type Tyre = "FL" | "FR" | "RL" | "RR";

type Props = {
  hotTyre?: Tyre | null;
  hotTemp?: number;
};

export function CarWireframe({ hotTyre = "RL", hotTemp = 138 }: Props) {
  // Top-down coordinates of each tyre center
  const tyres: Record<Tyre, { x: number; y: number; label: string }> = {
    FL: { x: 70,  y: 78,  label: "FL" },
    FR: { x: 70,  y: 162, label: "FR" },
    RL: { x: 330, y: 78,  label: "RL" },
    RR: { x: 330, y: 162, label: "RR" },
  };

  return (
    <div className="relative h-64 rounded-lg border border-cyan/40 carbon-fiber overflow-hidden">
      {/* Scan line */}
      <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-cyan)] to-transparent scan-line shadow-[0_0_18px_var(--color-cyan)]" />
      <div className="absolute top-2 left-2 text-[10px] tracking-[0.25em] text-cyan/80 z-10">SCANNING TELEMETRY · TOP-DOWN</div>
      <div className="absolute top-2 right-2 text-[10px] tracking-[0.25em] text-cyan/80 z-10">F1-W15 · #44</div>

      <svg viewBox="0 0 400 240" className="absolute inset-0 w-full h-full">
        <defs>
          {/* Body shading (dark center, lighter edges) */}
          <linearGradient id="bodyShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.42 0.01 270)" />
            <stop offset="50%" stopColor="oklch(0.22 0.005 270)" />
            <stop offset="100%" stopColor="oklch(0.42 0.01 270)" />
          </linearGradient>
          <linearGradient id="noseShade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.5 0.02 200)" />
            <stop offset="100%" stopColor="oklch(0.28 0.01 270)" />
          </linearGradient>
          {/* Tyre rubber radial */}
          <radialGradient id="tyreGrad" cx="0.4" cy="0.35" r="0.7">
            <stop offset="0%" stopColor="oklch(0.32 0.005 270)" />
            <stop offset="60%" stopColor="oklch(0.18 0.003 270)" />
            <stop offset="100%" stopColor="oklch(0.10 0.002 270)" />
          </radialGradient>
          {/* Rim metallic */}
          <radialGradient id="rimGrad" cx="0.4" cy="0.4" r="0.6">
            <stop offset="0%" stopColor="oklch(0.85 0.01 270)" />
            <stop offset="100%" stopColor="oklch(0.4 0.01 270)" />
          </radialGradient>
          {/* Heat aura */}
          <radialGradient id="heatGrad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="oklch(0.78 0.26 25)" stopOpacity="0.95" />
            <stop offset="60%" stopColor="oklch(0.62 0.26 25)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="oklch(0.62 0.26 25)" stopOpacity="0" />
          </radialGradient>
          {/* Cyan edge highlight */}
          <linearGradient id="edgeCyan" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(0.86 0.18 200)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="oklch(0.86 0.18 200)" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Floor shadow */}
        <ellipse cx="200" cy="220" rx="170" ry="10" fill="black" opacity="0.5" />

        {/* Front wing */}
        <rect x="20" y="92" width="50" height="56" rx="3" fill="url(#noseShade)" stroke="oklch(0.86 0.18 200 / 0.5)" />
        <rect x="20" y="98" width="50" height="6" fill="oklch(0.86 0.18 200 / 0.25)" />
        <rect x="20" y="138" width="50" height="6" fill="oklch(0.86 0.18 200 / 0.25)" />

        {/* Nose cone */}
        <path d="M70,108 Q120,110 160,108 L160,132 Q120,130 70,132 Z" fill="url(#bodyShade)" stroke="oklch(0.86 0.18 200 / 0.5)" />

        {/* Sidepods */}
        <path d="M155,70 Q230,55 295,75 L295,165 Q230,185 155,170 Z" fill="url(#bodyShade)" stroke="oklch(0.86 0.18 200 / 0.6)" strokeWidth="1.2" />
        {/* Side panel highlight */}
        <path d="M170,80 Q230,68 285,82" stroke="url(#edgeCyan)" fill="none" strokeWidth="1.2" />
        <path d="M170,160 Q230,172 285,158" stroke="url(#edgeCyan)" fill="none" strokeWidth="1.2" />

        {/* Cockpit + halo */}
        <ellipse cx="210" cy="120" rx="22" ry="14" fill="oklch(0.10 0.002 270)" stroke="oklch(0.86 0.18 200 / 0.7)" />
        <ellipse cx="210" cy="120" rx="14" ry="9" fill="oklch(0.18 0.005 200)" />
        <path d="M196,120 Q210,108 224,120" stroke="oklch(0.86 0.18 200)" fill="none" strokeWidth="1.5" />

        {/* Engine cover + airbox */}
        <path d="M240,108 L275,112 L275,128 L240,132 Z" fill="oklch(0.28 0.005 270)" stroke="oklch(0.86 0.18 200 / 0.4)" />
        <circle cx="245" cy="120" r="4" fill="oklch(0.10 0 0)" stroke="oklch(0.86 0.18 200 / 0.5)" />

        {/* Rear wing */}
        <rect x="320" y="70" width="60" height="100" rx="3" fill="url(#noseShade)" stroke="oklch(0.86 0.18 200 / 0.5)" />
        <line x1="335" y1="70" x2="335" y2="170" stroke="oklch(0.86 0.18 200 / 0.4)" />
        <line x1="350" y1="70" x2="350" y2="170" stroke="oklch(0.86 0.18 200 / 0.4)" />
        <line x1="365" y1="70" x2="365" y2="170" stroke="oklch(0.86 0.18 200 / 0.4)" />

        {/* Diffuser strakes */}
        <g stroke="oklch(0.86 0.18 200 / 0.3)" strokeDasharray="3 3">
          <line x1="160" y1="120" x2="290" y2="120" />
          <line x1="170" y1="100" x2="280" y2="100" />
          <line x1="170" y1="140" x2="280" y2="140" />
        </g>

        {/* Tyres */}
        {(Object.keys(tyres) as Tyre[]).map((k) => {
          const t = tyres[k];
          const isHot = hotTyre === k;
          return (
            <g key={k}>
              {isHot && (
                <circle
                  cx={t.x}
                  cy={t.y}
                  r={32}
                  fill="url(#heatGrad)"
                  className="tyre-aura"
                />
              )}
              {/* Tyre body */}
              <ellipse cx={t.x} cy={t.y} rx={22} ry={14} fill="url(#tyreGrad)" stroke={isHot ? "oklch(0.78 0.22 25)" : "oklch(0.86 0.18 200 / 0.5)"} strokeWidth={isHot ? 1.6 : 1} />
              {/* Tread lines */}
              <line x1={t.x - 18} y1={t.y - 7} x2={t.x + 18} y2={t.y - 7} stroke="oklch(0.05 0 0)" />
              <line x1={t.x - 18} y1={t.y + 7} x2={t.x + 18} y2={t.y + 7} stroke="oklch(0.05 0 0)" />
              {/* Rim */}
              <ellipse cx={t.x} cy={t.y} rx={10} ry={6} fill="url(#rimGrad)" />
              <circle cx={t.x} cy={t.y} r={2} fill="oklch(0.10 0 0)" />
              {/* Label */}
              <text
                x={t.x}
                y={t.y < 120 ? t.y - 22 : t.y + 28}
                textAnchor="middle"
                fontSize="9"
                letterSpacing="2"
                fill={isHot ? "oklch(0.82 0.22 25)" : "oklch(0.7 0.05 200)"}
                fontWeight={isHot ? 700 : 400}
              >
                {t.label}{isHot ? ` ${hotTemp}°C` : ""}
              </text>
            </g>
          );
        })}
      </svg>

      {/* corner brackets */}
      <span className="absolute top-1 left-1 w-4 h-4 border-l-2 border-t-2 border-cyan" />
      <span className="absolute top-1 right-1 w-4 h-4 border-r-2 border-t-2 border-cyan" />
      <span className="absolute bottom-1 left-1 w-4 h-4 border-l-2 border-b-2 border-cyan" />
      <span className="absolute bottom-1 right-1 w-4 h-4 border-r-2 border-b-2 border-cyan" />
    </div>
  );
}
