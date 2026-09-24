"use client";

import { useId, useState } from "react";
import { useCounterController } from "@/hooks/use-counter";
import CodeExample from "@/components/code/code-example";
import CounterSettingsFields from "./counter-settings";
import {
  COUNTER_DEFAULTS,
  type CounterDirection,
  type CounterPreset,
  type CounterSettings,
} from "./counter-config";

interface CounterProps {
  direction: CounterDirection;
}

export default function Counter({ direction }: CounterProps) {
  const id = useId();
  const [running, setRunning] = useState(true);
  const [settings, setSettings] = useState<CounterSettings>(COUNTER_DEFAULTS);
  const [announcement, setAnnouncement] = useState("");
  const { intervalMs, step } = settings;
  const forwards = direction === "forward";
  const { count, reset, tick } = useCounterController(forwards, { running, ...settings });
  const title = `${forwards ? "Forward" : "Backward"} counter`;
  const sign = forwards ? "+" : "−";
  const code = `const { count, tick, reset } = useCounterController(${forwards}, {\n  running: ${running},\n  intervalMs: ${intervalMs},\n  step: ${step},\n});`;

  function changeSettings(nextSettings: CounterSettings) {
    setSettings(nextSettings);
    setAnnouncement("");
  }

  function applyPreset({ name, intervalMs, step }: CounterPreset) {
    setSettings({ intervalMs, step });
    setAnnouncement(`${name} preset applied. Current count preserved.`);
  }

  function toggleRunning() {
    setRunning((value) => !value);
    setAnnouncement("");
  }

  function advanceOnce() {
    tick();
    setAnnouncement(`Count: ${count + (forwards ? step : -step)}.`);
  }

  function resetCounter() {
    // Reset state in place so keyboard focus and an open code panel survive.
    setRunning(true);
    setSettings(COUNTER_DEFAULTS);
    reset();
    setAnnouncement("Reset to zero. Running at one step per second.");
  }

  return (
    <section className={`counter-card counter-${direction}`} aria-labelledby={`${id}-title`}>
      <div className="counter-heading">
        <div className="counter-identity">
          <span className="direction-icon" aria-hidden="true">
            {forwards ? "↗" : "↘"}
          </span>
          <div>
            <h3 id={`${id}-title`}>{title}</h3>
            <p className="counter-description">
              {forwards ? "A little further, every tick." : "A step back, at your own pace."}
            </p>
          </div>
        </div>
        <span
          role="status"
          aria-label={`${title} status`}
          className={`status ${running ? "is-running" : ""}`}
        >
          <span aria-hidden="true" />
          {running ? "Running" : "Paused"}
        </span>
      </div>

      <div className="counter-display">
        <span className="value-label">CURRENT COUNT</span>
        {/* Announce user actions below, rather than interrupting readers on every timer tick. */}
        <output className="counter-value" aria-label={`${title} value`} aria-live="off">
          {count}
        </output>
        <span className="step-label">
          {sign}
          {step} per tick <span aria-hidden="true">·</span> {1000 / intervalMs}{" "}
          {intervalMs === 1000 ? "tick" : "ticks"} / second
        </span>
      </div>

      <CounterSettingsFields
        id={id}
        title={title}
        sign={sign}
        settings={settings}
        onChange={changeSettings}
        onPreset={applyPreset}
      />

      <div className="counter-actions">
        <button
          className="toggle-button"
          type="button"
          aria-label={`${running ? "Pause" : "Resume"} ${direction} counter`}
          onClick={toggleRunning}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            {running ? <path d="M4 3h3v10H4zm5 0h3v10H9z" /> : <path d="m4 2 10 6-10 6z" />}
          </svg>
          {running ? "Pause" : "Resume"}
        </button>
        <button
          className="step-button"
          type="button"
          disabled={running}
          aria-label={`Step ${direction} counter`}
          aria-describedby={`${id}-step-help`}
          onClick={advanceOnce}
        >
          <span aria-hidden="true">{forwards ? "↗" : "↘"}</span> Step
        </button>
        <button
          className="reset-button"
          type="button"
          aria-label={`Reset ${direction} counter`}
          onClick={resetCounter}
        >
          <span aria-hidden="true">↺</span> Reset
        </button>
      </div>
      <p className="step-help" id={`${id}-step-help`}>
        {running
          ? "Pause to advance one step at a time."
          : "Step advances once. Resume restarts the timer."}
      </p>
      <span className="sr-only" role="status">
        {announcement}
      </span>

      <details className="live-code">
        <summary>
          <span aria-hidden="true">&#123; &#125;</span> Live code
          <span className="live-code-hint">Matches your settings</span>
        </summary>
        {/* A new configuration discards clipboard feedback about the previous snippet. */}
        <CodeExample key={code} code={code} label={`${title} code`} />
      </details>
    </section>
  );
}
