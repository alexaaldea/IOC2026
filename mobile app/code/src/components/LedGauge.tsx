type Props = {
  value: number;            // 0..max
  max: number;
  segments?: number;
  /** Threshold (0..1) at which color shifts to warn/red */
  warnAt?: number;
  redAt?: number;
  /** force color regardless of thresholds */
  tone?: "mint" | "warn" | "red";
  orientation?: "horizontal" | "vertical";
  className?: string;
};

/**
 * Segmented LED block gauge — vertical or horizontal.
 * Used for tyre temps, fuel, ERS, etc.
 */
export function LedGauge({
  value,
  max,
  segments = 14,
  warnAt = 0.6,
  redAt = 0.85,
  tone,
  orientation = "horizontal",
  className = "",
}: Props) {
  const pct = Math.max(0, Math.min(1, value / max));
  const lit = Math.round(pct * segments);

  const colorFor = (i: number) => {
    if (i >= lit) return "";
    if (tone === "mint") return "on-mint";
    if (tone === "warn") return "on-warn";
    if (tone === "red") return "on-red";
    const p = (i + 1) / segments;
    if (p > redAt) return "on-red";
    if (p > warnAt) return "on-warn";
    return "on-mint";
  };

  const isV = orientation === "vertical";

  return (
    <div
      className={`flex ${isV ? "flex-col-reverse" : "flex-row"} ${className}`}
      style={{ gap: 2 }}
      aria-label={`Gauge ${value} of ${max}`}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <span
          key={i}
          className={`led-seg ${colorFor(i)}`}
          style={
            isV
              ? { width: "100%", height: `calc((100% - ${(segments - 1) * 2}px) / ${segments})` }
              : { height: "100%", width: `calc((100% - ${(segments - 1) * 2}px) / ${segments})` }
          }
        />
      ))}
    </div>
  );
}
