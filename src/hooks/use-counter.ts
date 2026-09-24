"use client";

import { useEffect, useState } from "react";

export interface CounterOptions {
  /** Pause without discarding the current count. */
  running?: boolean;
  /** Milliseconds between ticks; must be finite and at least 1. */
  intervalMs?: number;
}

/** Independent timer state with automatic cleanup on pause, change, and unmount. */
export default function useCounter(
  forwards = true,
  { running = true, intervalMs = 1000 }: CounterOptions = {},
): number {
  const [counter, setCounter] = useState(0);
  if (!Number.isFinite(intervalMs) || intervalMs < 1 || intervalMs > 2_147_483_647) {
    throw new RangeError("intervalMs must be between 1 and 2147483647 milliseconds.");
  }

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setCounter((previous) => previous + (forwards ? 1 : -1));
    }, intervalMs);
    return () => clearInterval(interval);
  }, [forwards, running, intervalMs]);

  return counter;
}
