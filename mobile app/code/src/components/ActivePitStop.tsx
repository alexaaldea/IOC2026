import { useEffect, useState } from "react";
import { AlertOctagon } from "lucide-react";
import { toast } from "sonner";
import { HoldToConfirm } from "@/components/HoldToConfirm";

export function ActivePitStop({ onClose }: { onClose: () => void }) {
  const [time, setTime] = useState(0);
  const [chief, setChief] = useState(false);
  const [strategist, setStrategist] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime((t) => +(t + 0.1).toFixed(1)), 100);
    const a = setTimeout(() => setChief(true), 600);
    const b = setTimeout(() => setStrategist(true), 1400);
    return () => { clearInterval(id); clearTimeout(a); clearTimeout(b); };
  }, []);

  const abort = () => {
    toast.error("PIT STOP ABORTED", { description: "Crew stand-down · Driver staying out" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 carbon-fiber flex flex-col">
      <div className="px-4 pt-6 pb-3 border-b-2 border-racing-red">
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-[0.3em] text-racing-red font-bold blink">● ACTIVE PIT STOP</span>
          <span className="text-[10px] tracking-[0.25em] text-muted-foreground">CAR 44</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-8">
        <div className="text-center">
          <div className="text-[10px] tracking-[0.3em] text-cyan mb-2">STOP TIME</div>
          <div
            className="font-mono font-bold text-mint tabular-nums"
            style={{ fontSize: "8rem", lineHeight: 1 }}
          >
            {time.toFixed(1)}<span className="text-3xl text-muted-foreground">s</span>
          </div>
          <div className="text-[10px] tracking-[0.3em] text-muted-foreground mt-2">TARGET 2.4s</div>
        </div>

        <div className="w-full max-w-sm rounded-lg border border-cyan/40 carbon-fiber p-4">
          <div className="text-[10px] tracking-[0.3em] text-cyan mb-3">PARALLEL APPROVAL</div>
          <ApprovalRow label="Chief Engineer" ok={chief} />
          <ApprovalRow label="Race Strategist" ok={strategist} />
        </div>
      </div>

      <div className="px-4 pb-6 pt-2">
        <HoldToConfirm
          label="ABORT STOP (EMERGENCY)"
          tooltip="Hold to Abort"
          holdMs={1500}
          onConfirm={abort}
          icon={<AlertOctagon size={26} />}
        />
      </div>
    </div>
  );
}

function ApprovalRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold tracking-widest ${ok ? "text-[var(--color-success)]" : "text-muted-foreground"}`}>
          {ok ? "APPROVED" : "WAITING…"}
        </span>
        <span className={`w-3 h-3 rounded-full ${ok ? "bg-[var(--color-success)]" : "bg-muted blink"}`} style={ok ? { boxShadow: "0 0 10px var(--color-success)" } : undefined} />
      </div>
    </div>
  );
}
