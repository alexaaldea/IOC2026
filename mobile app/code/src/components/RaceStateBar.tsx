import { haptic } from "@/lib/haptics";
import { toast } from "sonner";
import { raceStore, useRaceState, type RaceState } from "@/lib/raceState";

const STATES: RaceState[] = ["PRACTICE", "QUALIFYING", "RACE", "SAFETY CAR"];

export function RaceStateBar() {
  const active = useRaceState();
  return (
    <div className="px-2 py-2 border-b border-border flex items-center justify-between gap-1 bg-[var(--color-carbon)]">
      {STATES.map((s) => {
        const on = active === s;
        return (
          <button
            key={s}
            onClick={() => {
              if (s === active) return;
              haptic(8);
              raceStore.set(s);
              toast(`RECONFIGURING HUD: ${s} PROTOCOL ACTIVE.`, {
                duration: 1800,
                position: "bottom-center",
                className: "font-mono tracking-[0.2em] text-[11px]",
              });
            }}
            className={`pressable flex-1 min-w-0 rounded-full px-2 py-1 text-[9px] tracking-[0.15em] font-bold border transition-none ${
              on
                ? "bg-mint text-[var(--primary-foreground)] border-mint"
                : "border-border text-muted-foreground"
            }`}
            style={{ borderRadius: 9999 }}
          >
            <span className="inline-flex items-center justify-center gap-1 w-full">
              <span
                className={`w-1 h-1 rounded-full shrink-0 ${on ? "bg-[var(--primary-foreground)]" : "bg-muted"}`}
              />
              <span className="truncate">{s}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
