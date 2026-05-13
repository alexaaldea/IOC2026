import type { ReactNode } from "react";

export function WatchFace({
  children,
  glow,
}: {
  children: ReactNode;
  glow: "green" | "red" | "neutral";
}) {
  const glowMap = {
    green:
      "shadow-[0_0_60px_-5px_rgba(0,255,136,0.55),inset_0_0_30px_rgba(0,255,136,0.18)] border-pit-green",
    red: "shadow-[0_0_60px_-5px_rgba(255,42,42,0.6),inset_0_0_30px_rgba(255,42,42,0.2)] border-pit-red",
    neutral:
      "shadow-[0_0_40px_-10px_rgba(255,255,255,0.15),inset_0_0_20px_rgba(255,255,255,0.04)] border-pit-border",
  } as const;

  return (
    <div className="flex min-h-screen items-center justify-center bg-pit-bg p-4">
      <div className="relative">
        {/* Bezel */}
        <div className="rounded-[3rem] bg-gradient-to-b from-neutral-800 to-black p-2 shadow-2xl">
          <div
            className={`relative aspect-square w-[22rem] sm:w-[26rem] overflow-hidden rounded-[2.5rem] border-2 bg-pit-bg transition-shadow duration-500 ${glowMap[glow]}`}
          >
            {/* scanline overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 3px)",
              }}
            />
            <div className="absolute inset-0 overflow-y-auto px-4 py-4 font-mono text-pit-text scrollbar-thin">
              {children}
            </div>
          </div>
        </div>
        {/* crown */}
        <div className="absolute -right-2 top-1/2 h-14 w-2 -translate-y-1/2 rounded-r bg-neutral-700" />
        <div className="absolute -right-2 top-[28%] h-6 w-2 rounded-r bg-neutral-700" />
      </div>
    </div>
  );
}
