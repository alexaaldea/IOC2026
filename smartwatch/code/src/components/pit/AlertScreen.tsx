import { motion } from "framer-motion";
import type { Alert } from "./types";

export function AlertScreen({
  alert,
  onAck,
}: {
  alert: Alert;
  onAck: () => void;
}) {
  return (
    <motion.div
      key="alert"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex h-full flex-col items-center justify-between py-2"
    >
      <div className="flex w-full items-center justify-between text-[10px] uppercase tracking-widest text-pit-red">
        <span className="blink">● CRITICAL</span>
        <span>HAPTIC :: x3</span>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="pulse-red flex h-28 w-28 items-center justify-center rounded-full border-2 border-pit-red bg-pit-red/10 text-3xl font-bold text-pit-red">
          !
        </div>
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-pit-muted">
            {alert.system}
          </div>
          <div className="mt-1 text-xl font-bold uppercase text-pit-red">
            {alert.label}
          </div>
          <div className="mt-1 text-2xl font-bold tabular-nums">
            {alert.value}
          </div>
        </div>
      </div>

      <button
        onClick={onAck}
        className="w-full rounded-2xl border border-pit-red bg-pit-red/15 py-4 text-sm font-bold uppercase tracking-widest text-pit-red active:bg-pit-red/30"
      >
        Acknowledge
      </button>
    </motion.div>
  );
}
