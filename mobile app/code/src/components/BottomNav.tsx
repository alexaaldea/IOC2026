import { Link } from "@tanstack/react-router";
import { Activity, Gauge, ClipboardList, Radio } from "lucide-react";

const items = [
  { to: "/", label: "HUB", icon: Activity },
  { to: "/telemetry", label: "TELEMETRY", icon: Gauge },
  { to: "/strategy", label: "STRATEGY", icon: ClipboardList },
  { to: "/comms", label: "COMMS", icon: Radio },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[var(--color-carbon)] border-t border-border">
      <ul className="grid grid-cols-4">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "text-cyan" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="flex flex-col items-center justify-center gap-1 min-h-[64px] py-2 transition-none data-[status=active]:bg-[color-mix(in_oklab,var(--color-cyan)_10%,transparent)]"
            >
              <Icon size={22} strokeWidth={2.2} />
              <span className="text-[10px] tracking-[0.18em] font-bold">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
