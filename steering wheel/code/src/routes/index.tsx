import { createFileRoute } from "@tanstack/react-router";
import SteeringWheel from "@/components/SteeringWheel";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center gap-6 p-6 bg-[radial-gradient(ellipse_at_top,oklch(0.22_0.02_250),oklch(0.08_0.005_250))]">
      <header className="text-center">
        <h1 className="font-display text-2xl tracking-[0.4em] text-foreground uppercase">
          Apex · Cockpit
        </h1>
        <p className="text-xs tracking-[0.3em] text-muted-foreground mt-1 uppercase">
          F1 Steering Wheel HUD
        </p>
      </header>
      <div className="pt-12 w-full flex justify-center">
        <SteeringWheel />
      </div>
    </main>
  );
}
