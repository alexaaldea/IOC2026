import { useRef, useState, type ReactNode, type PointerEvent as RPointerEvent } from "react";
import { motion } from "framer-motion";
import { Pin, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  accent?: "cyan" | "amber" | "magenta" | "red" | "green";
  initial: { x: number; y: number };
  width?: number;
  className?: string;
  children: ReactNode;
  badge?: string;
};

const accentMap = {
  cyan: "text-hud-cyan",
  amber: "text-hud-amber",
  magenta: "text-hud-magenta",
  red: "text-hud-red",
  green: "text-hud-green",
};

export function HoloPanel({ title, subtitle, accent = "cyan", initial, width, className, children, badge }: Props) {
  const [pos, setPos] = useState(initial);
  const [pinned, setPinned] = useState(false);
  const [hidden, setHidden] = useState(false);
  const drag = useRef<{ ox: number; oy: number; px: number; py: number } | null>(null);

  if (hidden) return null;

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (pinned) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { ox: pos.x, oy: pos.y, px: e.clientX, py: e.clientY };
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setPos({
      x: drag.current.ox + (e.clientX - drag.current.px),
      y: drag.current.oy + (e.clientY - drag.current.py),
    });
  };
  const onUp = () => { drag.current = null; };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ left: pos.x, top: pos.y, width }}
      className={cn("absolute panel-glass corner-brackets rounded-md select-none", className)}
    >
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-panel-border cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn("h-1.5 w-1.5 rounded-full bg-current animate-hud-pulse", accentMap[accent])} />
          <span className={cn("font-display text-[10px] tracking-[0.25em] uppercase truncate", accentMap[accent])}>
            {title}
          </span>
          {subtitle && <span className="text-[10px] text-muted-foreground truncate">{subtitle}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          {badge && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-hud-cyan/10 text-hud-cyan border border-hud-cyan/30">
              {badge}
            </span>
          )}
          <button onClick={() => setPinned((v) => !v)} className={cn("p-0.5 rounded hover:bg-white/5", pinned ? "text-hud-amber" : "text-muted-foreground")}>
            <Pin className="h-3 w-3" />
          </button>
          <button onClick={() => setHidden(true)} className="p-0.5 rounded hover:bg-white/5 text-muted-foreground">
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="p-3">{children}</div>
    </motion.div>
  );
}
