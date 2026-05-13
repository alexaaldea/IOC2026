import { useSyncExternalStore } from "react";

export type RaceState = "PRACTICE" | "QUALIFYING" | "RACE" | "SAFETY CAR";

let current: RaceState = "RACE";
const listeners = new Set<() => void>();

export const raceStore = {
  get: () => current,
  set: (s: RaceState) => {
    if (s === current) return;
    current = s;
    listeners.forEach((l) => l());
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useRaceState(): RaceState {
  return useSyncExternalStore(raceStore.subscribe, raceStore.get, raceStore.get);
}
