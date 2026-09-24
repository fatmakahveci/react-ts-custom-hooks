export type CounterDirection = "forward" | "backward";

export interface CounterSettings {
  intervalMs: number;
  step: number;
}

export interface CounterPreset extends CounterSettings {
  name: string;
}

// Presets change timing only; they must not reset the count or resume a paused timer.
export const COUNTER_DEFAULTS: Readonly<CounterSettings> = {
  intervalMs: 1000,
  step: 1,
};

export const COUNTER_PRESETS: readonly CounterPreset[] = [
  { name: "Steady", ...COUNTER_DEFAULTS },
  { name: "Sprint", intervalMs: 500, step: 5 },
  { name: "Slow", intervalMs: 2000, step: 1 },
];

export const INTERVAL_OPTIONS = [
  { value: 500, label: "0.5 seconds" },
  { value: 1000, label: "1 second" },
  { value: 2000, label: "2 seconds" },
] as const;

export const STEP_OPTIONS = [1, 2, 5, 10] as const;
