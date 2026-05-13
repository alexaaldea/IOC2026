import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";

type State = "idle" | "loading" | "synced";

type Props = {
  idleLabel: string;
  loadingLabel?: string;
  syncedLabel?: string;
  icon: React.ReactNode;
  /** ms spent in loading state */
  durationMs?: number;
  toastTitle?: string;
  toastDesc?: string;
};

export function SyncButton({
  idleLabel,
  loadingLabel = "Pushing Telemetry to AR…",
  syncedLabel = "AR SYNCED",
  icon,
  durationMs = 1400,
  toastTitle,
  toastDesc,
}: Props) {
  const [state, setState] = useState<State>("idle");

  const trigger = () => {
    if (state !== "idle") {
      // Allow re-sync from synced state
      if (state === "synced") setState("idle");
      return;
    }
    haptic(20);
    setState("loading");
    setTimeout(() => {
      setState("synced");
      haptic([15, 30, 15]);
      if (toastTitle) toast.success(toastTitle, { description: toastDesc });
    }, durationMs);
  };

  const synced = state === "synced";
  const loading = state === "loading";

  return (
    <button
      onClick={trigger}
      disabled={loading}
      className={`pressable w-full min-h-[56px] rounded-lg tracking-[0.2em] font-bold flex items-center justify-center gap-2 transition-none ${
        synced
          ? "bg-[var(--color-success)] text-primary-foreground"
          : loading
            ? "bg-cyan/30 text-cyan border border-cyan/60"
            : "bg-cyan text-primary-foreground glow-cyan"
      }`}
      style={synced ? { boxShadow: "0 0 14px var(--color-success)" } : undefined}
    >
      {synced ? <Check size={20} /> : loading ? <Loader2 size={18} className="animate-spin" /> : icon}
      <span>{synced ? syncedLabel : loading ? loadingLabel : idleLabel}</span>
    </button>
  );
}
