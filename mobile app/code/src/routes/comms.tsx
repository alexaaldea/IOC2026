import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Mic, Volume2 } from "lucide-react";

export const Route = createFileRoute("/comms")({
  head: () => ({
    meta: [
      { title: "Team Comms · Car 44" },
      { name: "description", content: "Pit-wall radio comms transcript with driver and engineers." },
    ],
  }),
  component: CommsPage,
});

const messages = [
  { who: "RACE ENG", to: "Driver", text: "Box this lap, box this lap. Mediums fitted.", t: "L34 · 12:42:01", color: "text-cyan" },
  { who: "DRIVER", to: "Pit", text: "Copy box. Rear-left feels gone.", t: "L34 · 12:42:08", color: "text-white" },
  { who: "STRATEGIST", to: "Crew", text: "Plan B confirmed. Undercut Verstappen.", t: "L33 · 12:41:30", color: "text-[var(--color-success)]" },
  { who: "ENGINEER", to: "Driver", text: "Push now, push now. Two laps to pit window.", t: "L33 · 12:40:55", color: "text-cyan" },
  { who: "DRIVER", to: "Pit", text: "Front wing one click more.", t: "L31 · 12:38:11", color: "text-white" },
];

function CommsPage() {
  return (
    <AppShell>
      <PageHeader eyebrow="COMMS" title="TEAM RADIO" status="OPEN" />
      <div className="px-4 pt-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className="rounded-lg border border-cyan/25 carbon-fiber p-3">
            <div className="flex items-center justify-between text-[10px] tracking-[0.2em] text-muted-foreground">
              <div className="flex items-center gap-2">
                <Volume2 size={12} />
                <span className={`${m.color} font-bold`}>{m.who}</span>
                <span>→ {m.to}</span>
              </div>
              <span>{m.t}</span>
            </div>
            <p className="mt-2 text-sm">{m.text}</p>
            <div className="mt-2 flex gap-0.5 h-4 items-end">
              {Array.from({ length: 28 }).map((_, j) => (
                <span key={j} className="w-1 bg-cyan/60 rounded-sm" style={{ height: `${20 + Math.abs(Math.sin(i + j)) * 80}%` }} />
              ))}
            </div>
          </div>
        ))}

        <button className="fixed bottom-24 right-4 w-16 h-16 rounded-full bg-racing-red glow-red flex items-center justify-center active:scale-95 transition-none">
          <Mic className="text-white" size={26} />
        </button>
      </div>
    </AppShell>
  );
}
