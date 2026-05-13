import { useEffect, useRef, useState } from "react";
import { haptic } from "@/lib/haptics";

type Props = {
  label: string;
  holdMs?: number;
  onConfirm: () => void;
  icon?: React.ReactNode;
  className?: string;
  tooltip?: string;
};

/**
 * Hold-to-confirm safety button. Tapping shows tooltip; user must hold
 * for `holdMs` to fire onConfirm. Releases early cancel and reset.
 */
export function HoldToConfirm({
  label,
  holdMs = 1500,
  onConfirm,
  icon,
  className = "",
  tooltip = "Hold to Abort",
}: Props) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const firedRef = useRef(false);

  const cancel = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startRef.current = null;
    setHolding(false);
    setProgress(0);
    firedRef.current = false;
  };

  const start = () => {
    if (firedRef.current) return;
    setShowTip(true);
    setHolding(true);
    haptic(15);
    startRef.current = performance.now();
    const tick = () => {
      if (startRef.current == null) return;
      const elapsed = performance.now() - startRef.current;
      const p = Math.min(1, elapsed / holdMs);
      setProgress(p);
      if (p >= 1 && !firedRef.current) {
        firedRef.current = true;
        haptic([60, 40, 120]);
        onConfirm();
        cancel();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (!showTip) return;
    const id = setTimeout(() => setShowTip(false), 2200);
    return () => clearTimeout(id);
  }, [showTip]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  return (
    <div className="relative w-full">
      {showTip && !holding && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded bg-black/90 border border-racing-red text-[10px] tracking-[0.25em] text-racing-red font-bold whitespace-nowrap">
          {tooltip.toUpperCase()} ▾
        </div>
      )}
      <button
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onContextMenu={(e) => e.preventDefault()}
        className={`relative overflow-hidden w-full min-h-[80px] bg-racing-red text-white text-xl tracking-[0.25em] font-bold flex items-center justify-center gap-3 border border-border select-none transition-none ${className}`}
        style={{ touchAction: "none", borderRadius: 6 }}
      >
        {/* Progress fill */}
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 bg-white/25"
          style={{ width: `${progress * 100}%`, transition: holding ? "none" : "width 120ms ease-out" }}
        />
        <span className="relative flex items-center gap-3">
          {icon}
          {holding ? `HOLD… ${Math.round(progress * 100)}%` : label}
        </span>
      </button>
      <div className="mt-1 text-center text-[10px] tracking-[0.3em] text-muted-foreground">
        SAFETY · PRESS &amp; HOLD {Math.round(holdMs / 1000)}s
      </div>
    </div>
  );
}
