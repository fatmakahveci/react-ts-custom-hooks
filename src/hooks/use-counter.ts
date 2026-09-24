"use client";

import { useCallback, useEffect, useState } from "react";

export interface CounterOptions {
  /** Pause without discarding the current count. */
  running?: boolean;
  /** Milliseconds between ticks; must be finite and between 1 and 2147483647. */
  intervalMs?: number;
  /** Positive safe integer added or subtracted on each tick. */
  step?: number;
}

export interface CounterController {
  count: number;
  /** Advance once using the current direction and step, even when paused. */
  tick: () => void;
  /** Restore zero; a running timer starts a full new interval. Options are retained. */
  reset: () => void;
}

/** Timer state with explicit reset and manual tick controls. */
export function useCounterController(
  forwards = true,
  { running = true, intervalMs = 1000, step = 1 }: CounterOptions = {},
): CounterController {
  const [count, setCount] = useState(0);
  const [generation, setGeneration] = useState(0);

  if (!Number.isFinite(intervalMs) || intervalMs < 1 || intervalMs > 2_147_483_647) {
    throw new RangeError("intervalMs must be between 1 and 2147483647 milliseconds.");
  }
  if (!Number.isSafeInteger(step) || step < 1) {
    throw new RangeError("step must be a positive safe integer.");
  }

  const tick = useCallback(() => {
    // Functional updates also preserve multiple manual ticks in the same React batch.
    setCount((previous) => previous + (forwards ? step : -step));
  }, [forwards, step]);

  const reset = useCallback(() => {
    setCount(0);
    // A reset at zero must restart the timer too, even if the count does not change.
    setGeneration((previous) => previous + 1);
  }, []);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(tick, intervalMs);
    // Cleanup runs before replacement as well as on pause, unmount, and Strict Mode replay.
    return () => clearInterval(interval);
  }, [running, intervalMs, tick, generation]);

  return { count, tick, reset };
}

/** Independent timer state with automatic cleanup on pause, change, and unmount. */
export default function useCounter(forwards = true, options: CounterOptions = {}): number {
  return useCounterController(forwards, options).count;
}
