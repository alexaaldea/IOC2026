// Simulated real-time telemetry stream.
// Emits coherent frames at ~5Hz using smooth random walks + lap dynamics,
// so ETA, HR, stress, brakes, tyres and car speed all evolve from a single
// ticking source instead of independent setIntervals.

export type TelemetryFrame = {
  t: number;          // monotonic tick (ms since stream start)
  etaSeconds: number; // pit-window ETA countdown
  hr: number;         // heart rate, BPM
  stress: number;     // stress level, 0-100
  lap: number;
  totalLaps: number;
  // Car telemetry
  speedKph: number;   // car speed
  gear: number;       // 1-8
  brakeTempC: number; // brake disc temp °C
  tyreTempC: number;  // average tyre surface temp °C
  tyrePsiRR: number;  // rear-right tyre pressure
  fuelKg: number;     // remaining fuel
};

type Listener = (f: TelemetryFrame) => void;

const TICK_MS = 200; // 5Hz

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

class TelemetryStream {
  private listeners = new Set<Listener>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private startedAt = 0;
  private frame: TelemetryFrame = {
    t: 0,
    etaSeconds: 72,
    hr: 118,
    stress: 60,
    lap: 32,
    totalLaps: 58,
    speedKph: 280,
    gear: 6,
    brakeTempC: 540,
    tyreTempC: 102,
    tyrePsiRR: 22.4,
    fuelKg: 38,
  };

  private paused = false;
  private pauseListeners = new Set<(p: boolean) => void>();

  getSnapshot(): TelemetryFrame {
    return this.frame;
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    fn(this.frame);
    if (!this.timer && !this.paused) this.start();
    return () => {
      this.listeners.delete(fn);
      if (this.listeners.size === 0) this.stop();
    };
  }

  onPauseChange(fn: (p: boolean) => void) {
    this.pauseListeners.add(fn);
    fn(this.paused);
    return () => {
      this.pauseListeners.delete(fn);
    };
  }

  isPaused() {
    return this.paused;
  }

  pause() {
    if (this.paused) return;
    this.paused = true;
    this.stop();
    this.pauseListeners.forEach((l) => l(true));
  }

  resume() {
    if (!this.paused) return;
    this.paused = false;
    if (this.listeners.size > 0) this.start();
    this.pauseListeners.forEach((l) => l(false));
  }

  toggle() {
    this.paused ? this.resume() : this.pause();
  }

  private start() {
    this.startedAt = Date.now();
    this.timer = setInterval(() => this.tick(), TICK_MS);
  }

  private stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private tick() {
    const f = this.frame;
    const dt = TICK_MS / 1000;

    // ETA ticks down; resets + advances lap when car arrives in box.
    let etaSeconds = f.etaSeconds - dt;
    let lap = f.lap;
    let fuelKg = f.fuelKg;
    if (etaSeconds <= 0) {
      etaSeconds = 80 + Math.random() * 40;
      lap = lap >= f.totalLaps ? 1 : lap + 1;
      fuelKg = lap === 1 ? 105 : Math.max(2, fuelKg - 1.9);
    }

    // Pit pressure rises as window closes.
    const pitPressure = clamp(1 - etaSeconds / 90, 0, 1);

    // Stress / HR coupled.
    const stressTarget = 35 + pitPressure * 55;
    const stress = clamp(
      f.stress + (stressTarget - f.stress) * 0.05 + (Math.random() - 0.5) * 2,
      20, 98,
    );
    const hrTarget = 95 + stress * 0.55;
    const hr = clamp(
      f.hr + (hrTarget - f.hr) * 0.1 + (Math.random() - 0.5) * 1.5,
      90, 178,
    );

    // Car: speed dips on braking zones (sinusoidal lap profile).
    const lapPhase = (etaSeconds % 8) / 8 * Math.PI * 2;
    const speedTarget = 220 + Math.sin(lapPhase) * 90 + Math.cos(lapPhase * 1.7) * 20;
    const speedKph = clamp(
      f.speedKph + (speedTarget - f.speedKph) * 0.25 + (Math.random() - 0.5) * 4,
      60, 345,
    );
    const gear = clamp(Math.round(2 + (speedKph / 345) * 6), 1, 8);

    // Brake temp climbs on hard braking (low speed transitions), cools otherwise.
    const braking = speedKph < f.speedKph - 1 ? 1 : 0;
    const brakeTarget = 380 + braking * 520 + pitPressure * 60;
    const brakeTempC = clamp(
      f.brakeTempC + (brakeTarget - f.brakeTempC) * 0.08 + (Math.random() - 0.5) * 6,
      280, 980,
    );

    // Tyre surface temp tracks load + pit pressure (degradation as ETA shrinks).
    const tyreTarget = 95 + pitPressure * 25 + (speedKph / 345) * 15;
    const tyreTempC = clamp(
      f.tyreTempC + (tyreTarget - f.tyreTempC) * 0.04 + (Math.random() - 0.5) * 1.2,
      70, 135,
    );

    // RR pressure inflates with heat then drops on out-lap reset.
    const psiTarget = 21.5 + (tyreTempC - 95) * 0.06;
    const tyrePsiRR = clamp(
      f.tyrePsiRR + (psiTarget - f.tyrePsiRR) * 0.05 + (Math.random() - 0.5) * 0.05,
      18, 25,
    );

    this.frame = {
      t: Date.now() - this.startedAt,
      etaSeconds,
      hr: Math.round(hr),
      stress: Math.round(stress),
      lap,
      totalLaps: f.totalLaps,
      speedKph: Math.round(speedKph),
      gear,
      brakeTempC: Math.round(brakeTempC),
      tyreTempC: Math.round(tyreTempC * 10) / 10,
      tyrePsiRR: Math.round(tyrePsiRR * 10) / 10,
      fuelKg: Math.round(fuelKg * 10) / 10,
    };

    for (const l of this.listeners) l(this.frame);
  }
}

export const telemetry = new TelemetryStream();
