# F1-PIT MR Headset System — Build Plan

A single-screen simulated MR experience that mimics what a pit engineer sees through an AR headset: floating holographic panels arranged spatially around a central driver-cam stream, with live-updating telemetry, AI strategy, comms, and pit-stop mode.

## Visual Direction

- **Aesthetic**: dark glassmorphism (blurred translucent panels, thin neon borders), Mercedes/Red Bull-inspired teal–cyan + amber + magenta accents on near-black background, subtle scanline + grid floor for "spatial" depth.
- **Typography**: technical mono for numbers (JetBrains Mono / Geist Mono), condensed sans for labels (e.g. Rajdhani / Orbitron for headers).
- **Tokens** added to `src/styles.css` (oklch): `--hud-cyan`, `--hud-amber`, `--hud-magenta`, `--hud-green`, `--hud-red`, `--panel-glass`, `--panel-border`, `--glow-cyan`, gradients + shadow tokens for holographic glow.
- **Motion**: subtle float/parallax on panels, scanline shimmer, animated radial gauges, pulsing alerts, panel open/close with scale + blur.

## Layout (single route `/`)

```
┌─────────────────────────────────────────────────────────────┐
│  Top status bar: lap, position, flag, weather, fuel, tires │
├──────────────┬──────────────────────────────┬───────────────┤
│ Telemetry    │   Driver cockpit stream      │ AI Strategy   │
│ panels       │   + overlay (speed/gear/     │ Assistant     │
│ (tires,      │    racing line)              │               │
│ brakes, ERS, │                              │ Team Comms    │
│ RPM, gauges) │                              │ (radio cards) │
├──────────────┴──────────────────────────────┴───────────────┤
│ Bottom critical strip: gap ahead/behind, sector times, DRS │
└─────────────────────────────────────────────────────────────┘
   Floating: spatial notifications, pit-mode overlay, watch widget
```

Panels are draggable (pointer drag = simulated pinch-and-move), with a "pin" toggle. A faux 3D grid background + subtle perspective transforms sell the spatial feel.

## Components

- `SpatialCanvas` — root with grid floor, vignette, ambient glow, hosts draggable panels.
- `HoloPanel` — reusable glass panel wrapper (drag handle, pin, close, neon border, corner brackets).
- `RaceStatusBar` — lap, position, flag indicator, SC/weather, fuel %.
- `TelemetryStack`:
  - `TireWidget` (4 tires, temp gradient, wear %)
  - `BrakeTempWidget`
  - `ERSGauge` (radial)
  - `RPMGauge` + `Speedometer` (radial)
  - `GearIndicator`
  - `EngineHealthBar`, `DownforceBar`, `AeroBalance`
  - `FuelChart` (animated line via Recharts)
- `DriverStream` — central panel: looping cockpit-style video/animated background + HUD overlay (speed, gear, racing line SVG, overtake mode, pit window).
- `AIStrategyPanel` — chat-style cards with typed-in messages cycling on a timer ("Pit window optimal in 2 laps", etc.).
- `CommsPanel` — radio cards w/ animated waveform (CSS bars), priority badges, mute buttons.
- `CriticalStrip` — bottom: gap ahead/behind, S1/S2/S3 times, DRS, fastest lap.
- `PitModeOverlay` — full-canvas red/amber takeover: countdown, crew positions diagram, tire compound, animated checklist, danger zones.
- `SpatialNotification` — toast-like cards anchored at random spatial positions (puncture, penalty, weather, fastest lap).
- `GestureHintBar` — bottom-right legend (pinch / grab / air-tap / voice).
- `VoiceCommandIndicator` — listening dot + transcribed faux command.
- `SmartwatchWidget` — small floating card: HR bpm, pit sync timer, haptic pulse.

## Data simulation

- `useTelemetry` hook with `setInterval` driving randomized but bounded values (speed 80–340 km/h, RPM 8k–15k, tire temps with slow drift, ERS sawtooth, fuel decreasing).
- `useRaceState` for lap/position/gap/sector progression.
- `useAIMessages` cycles a queue of strategy messages.
- `useNotifications` dispatches spatial alerts on a schedule + a manual "Trigger Pit Mode" button.

## Interactions

- Pointer drag on panel header → move (simulated grab); double-click → pin.
- Click "Activate Pit Mode" (or auto-trigger every ~60s) → `PitModeOverlay` slides in.
- Hover on telemetry → glow + scale (eye-tracking focus simulation).
- Voice command bar accepts typed/clicked preset commands that show/hide panels.

## Technical

- Stack: existing TanStack Start + Tailwind v4 + shadcn. Add **framer-motion** and **recharts** via `bun add`.
- All work on `src/routes/index.tsx` + new `src/components/mr/*`.
- Tokens in `src/styles.css`; semantic classes only — no raw hex in components.
- Update `__root.tsx` head meta: title "F1-PIT MR — Pit Engineer HUD", description, og tags.
- SSR-safe: guard `window` access in drag/animation hooks.

## Out of scope (clearly faked)

Real WebXR/headset APIs, real video stream, real voice recognition, real hand tracking — all simulated visually. This is a high-fidelity prototype, not a deployable MR app.

## Deliverable

A polished single-page experience that, on load, looks like the live HUD of an F1 pit engineer: telemetry ticking, driver cam playing, AI suggestions appearing, radio chatter pulsing, and pit-mode demo on a button press.
