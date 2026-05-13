import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { RaceStateBar } from "./RaceStateBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-carbon)] text-foreground">
      <div className="mx-auto max-w-md pb-24">
        <RaceStateBar />
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

export function PageHeader({ eyebrow, title, status }: { eyebrow?: string; title: string; status?: string }) {
  return (
    <header className="border-b border-border px-4 pt-4 pb-3 bg-[var(--color-carbon)]">
      <div className="flex items-center justify-between">
        <div>
          {eyebrow && <p className="text-[10px] tracking-[0.3em] text-mint">{eyebrow}</p>}
          <h1 className="text-xl font-bold tracking-[0.15em] mt-1">{title}</h1>
        </div>
        {status && (
          <div className="flex items-center gap-2 px-2 py-1 border border-border rounded" style={{ borderRadius: 6 }}>
            <span className="w-2 h-2 rounded-full bg-mint blink" />
            <span className="text-[10px] tracking-[0.2em] text-mint">{status}</span>
          </div>
        )}
      </div>
    </header>
  );
}
