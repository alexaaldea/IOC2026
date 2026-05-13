export function haptic(pattern: number | number[] = 25) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern as any);
    }
  } catch {
    /* no-op */
  }
}
