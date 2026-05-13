import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { WatchFace } from "@/components/pit/WatchFace";
import { Dashboard } from "@/components/pit/Dashboard";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "F1-PIT · Pit Crew Smartwatch" },
      {
        name: "description",
        content:
          "Tactical telemetry smartwatch interface for F1 pit crew — live pit window, alerts, comms and biometrics.",
      },
    ],
  }),
});

function Index() {
  // Listen to status from dashboard via custom event for glow
  const [glow, setGlow] = useState<"green" | "red" | "neutral">("neutral");

  useEffect(() => {
    const onStatus = (e: Event) => {
      const detail = (e as CustomEvent<"green" | "red" | "neutral">).detail;
      setGlow(detail);
    };
    window.addEventListener("pit-glow", onStatus);
    return () => window.removeEventListener("pit-glow", onStatus);
  }, []);

  return (
    <WatchFace glow={glow}>
      <Dashboard />
    </WatchFace>
  );
}
