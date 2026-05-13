import { useEffect, useState } from "react";

export type Telemetry = {
  speed: number;
  rpm: number;
  gear: number;
  ers: number;
  fuel: number;
  drs: boolean;
  tires: { fl: number; fr: number; rl: number; rr: number };
  tireWear: { fl: number; fr: number; rl: number; rr: number };
  brakes: { fl: number; fr: number; rl: number; rr: number };
  engine: number;
  downforce: number;
  aero: number;
  throttle: number;
  brake: number;
  fuelHistory: { t: number; v: number }[];
  speedHistory: { t: number; v: number }[];
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function useTelemetry() {
  const [t, setT] = useState<Telemetry>(() => ({
    speed: 287,
    rpm: 11200,
    gear: 6,
    ers: 64,
    fuel: 78,
    drs: false,
    tires: { fl: 98, fr: 102, rl: 96, rr: 99 },
    tireWear: { fl: 22, fr: 24, rl: 19, rr: 21 },
    brakes: { fl: 540, fr: 555, rl: 480, rr: 495 },
    engine: 96,
    downforce: 82,
    aero: 51,
    throttle: 88,
    brake: 0,
    fuelHistory: Array.from({ length: 20 }, (_, i) => ({ t: i, v: 100 - i * 1.1 })),
    speedHistory: Array.from({ length: 30 }, (_, i) => ({ t: i, v: 200 + Math.sin(i / 2) * 80 })),
  }));

  useEffect(() => {
    const id = setInterval(() => {
      setT((p) => {
        const speed = clamp(p.speed + (Math.random() - 0.5) * 40, 80, 340);
        const gear = speed < 120 ? 3 : speed < 180 ? 5 : speed < 240 ? 6 : speed < 300 ? 7 : 8;
        const rpm = clamp(8000 + (speed / 340) * 6500 + (Math.random() - 0.5) * 400, 7800, 15000);
        const drs = speed > 280 && Math.random() > 0.4;
        const ers = clamp(p.ers + (Math.random() > 0.5 ? -2 : 1.4), 4, 100);
        const fuel = clamp(p.fuel - 0.05, 0, 100);
        const drift = (k: number) => clamp(k + (Math.random() - 0.5) * 1.2, 70, 130);
        const driftB = (k: number) => clamp(k + (Math.random() - 0.5) * 18, 280, 720);
        const wearStep = (k: number) => clamp(k + 0.02, 0, 100);
        return {
          ...p,
          speed,
          rpm,
          gear,
          ers,
          fuel,
          drs,
          tires: {
            fl: drift(p.tires.fl),
            fr: drift(p.tires.fr),
            rl: drift(p.tires.rl),
            rr: drift(p.tires.rr),
          },
          tireWear: {
            fl: wearStep(p.tireWear.fl),
            fr: wearStep(p.tireWear.fr),
            rl: wearStep(p.tireWear.rl),
            rr: wearStep(p.tireWear.rr),
          },
          brakes: {
            fl: driftB(p.brakes.fl),
            fr: driftB(p.brakes.fr),
            rl: driftB(p.brakes.rl),
            rr: driftB(p.brakes.rr),
          },
          engine: clamp(p.engine + (Math.random() - 0.55) * 0.4, 80, 100),
          downforce: clamp(p.downforce + (Math.random() - 0.5) * 4, 60, 100),
          aero: clamp(p.aero + (Math.random() - 0.5) * 3, 40, 60),
          throttle: clamp(p.throttle + (Math.random() - 0.5) * 30, 0, 100),
          brake: Math.random() > 0.7 ? Math.random() * 70 : 0,
          fuelHistory: [...p.fuelHistory.slice(-19), { t: p.fuelHistory.length, v: fuel }],
          speedHistory: [...p.speedHistory.slice(-29), { t: p.speedHistory.length, v: speed }],
        };
      });
    }, 600);
    return () => clearInterval(id);
  }, []);

  return t;
}

export type RaceState = {
  lap: number;
  totalLaps: number;
  position: number;
  gapAhead: string;
  gapBehind: string;
  sectors: { s1: number; s2: number; s3: number };
  bestLap: string;
  lastLap: string;
  flag: "green" | "yellow" | "red" | "sc";
  weather: { temp: number; track: number; rain: number; condition: string };
};

export function useRaceState() {
  const [r, setR] = useState<RaceState>({
    lap: 28,
    totalLaps: 57,
    position: 3,
    gapAhead: "+1.247",
    gapBehind: "-0.832",
    sectors: { s1: 24.118, s2: 31.402, s3: 22.987 },
    bestLap: "1:18.402",
    lastLap: "1:18.507",
    flag: "green",
    weather: { temp: 28, track: 41, rain: 12, condition: "Dry" },
  });

  useEffect(() => {
    const id = setInterval(() => {
      setR((p) => ({
        ...p,
        gapAhead: `+${(Math.random() * 2 + 0.5).toFixed(3)}`,
        gapBehind: `-${(Math.random() * 1.5 + 0.3).toFixed(3)}`,
        sectors: {
          s1: 23.8 + Math.random() * 0.6,
          s2: 31.1 + Math.random() * 0.7,
          s3: 22.7 + Math.random() * 0.5,
        },
        weather: { ...p.weather, rain: clamp(p.weather.rain + (Math.random() - 0.45) * 4, 0, 100) },
      }));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return [r, setR] as const;
}

export const aiMessageQueue = [
  { tag: "STRATEGY", text: "Pit window optimal in 2 laps.", level: "info" as const },
  { tag: "TIRE", text: "Medium tires projected to lose pace in 4 laps.", level: "warn" as const },
  { tag: "WEATHER", text: "Rain probability increasing by 37% over next 8 laps.", level: "warn" as const },
  { tag: "RIVAL", text: "Car #16 attempting undercut. Counter pit recommended.", level: "alert" as const },
  { tag: "ENGINE", text: "Engine map 5 advised — preserve PU for stint 3.", level: "info" as const },
  { tag: "ERS", text: "Deploy full ERS into T7 for overtake on Car #44.", level: "info" as const },
  { tag: "FUEL", text: "Fuel margin +1.4 laps. Lift & coist not required.", level: "info" as const },
  { tag: "ALERT", text: "Yellow sector 2 cleared. Resume push laps.", level: "alert" as const },
];

export function useAIFeed() {
  const [msgs, setMsgs] = useState(() => aiMessageQueue.slice(0, 3));
  useEffect(() => {
    let i = 3;
    const id = setInterval(() => {
      const next = aiMessageQueue[i % aiMessageQueue.length];
      i++;
      setMsgs((p) => [next, ...p].slice(0, 5));
    }, 4500);
    return () => clearInterval(id);
  }, []);
  return msgs;
}

export const radioMessages = [
  { from: "DRIVER", text: "Box this lap, box this lap?", priority: "high" as const, time: "L28" },
  { from: "ENGINEER", text: "Negative, stay out. Push for 2 more.", priority: "normal" as const, time: "L28" },
  { from: "DRIVER", text: "Front-left graining, losing rear on T11.", priority: "high" as const, time: "L27" },
  { from: "STRATEGY", text: "Target lap 1:18.3 — gap to Hamilton stable.", priority: "normal" as const, time: "L26" },
  { from: "ENGINEER", text: "DRS enabled. Use it into T1.", priority: "normal" as const, time: "L26" },
];

export function useRadioFeed() {
  const [msgs, setMsgs] = useState(radioMessages);
  useEffect(() => {
    const id = setInterval(() => {
      setMsgs((p) => {
        const rotated = [...p.slice(1), p[0]];
        return rotated;
      });
    }, 6000);
    return () => clearInterval(id);
  }, []);
  return msgs;
}

export type SpatialNotification = {
  id: number;
  type: "warning" | "alert" | "info" | "danger";
  title: string;
  body: string;
  x: number;
  y: number;
};

const notifTemplates = [
  { type: "danger" as const, title: "TIRE PUNCTURE RISK", body: "FL pressure dropping — monitor lap 30." },
  { type: "alert" as const, title: "FASTEST LAP", body: "Sector purple — on for personal best." },
  { type: "warning" as const, title: "WEATHER SHIFT", body: "Wind +12kph crosswind incoming T9." },
  { type: "info" as const, title: "RIVAL PIT", body: "Car #16 entered pit lane." },
  { type: "danger" as const, title: "UNSAFE RELEASE", body: "Crew clearance check required." },
];

export function useSpatialNotifications() {
  const [items, setItems] = useState<SpatialNotification[]>([]);
  useEffect(() => {
    let id = 1;
    const tick = () => {
      const tpl = notifTemplates[Math.floor(Math.random() * notifTemplates.length)];
      const n: SpatialNotification = {
        id: id++,
        ...tpl,
        x: 10 + Math.random() * 70,
        y: 15 + Math.random() * 55,
      };
      setItems((p) => [...p.slice(-2), n]);
      setTimeout(() => setItems((p) => p.filter((x) => x.id !== n.id)), 5500);
    };
    const i = setInterval(tick, 7000);
    setTimeout(tick, 1200);
    return () => clearInterval(i);
  }, []);
  return items;
}
