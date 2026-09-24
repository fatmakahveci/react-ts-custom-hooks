"use client";

import { useState } from "react";
import useCounter from "@/hooks/use-counter";

interface CounterProps {
  direction: "forward" | "backward";
}

function CounterSession({ direction, onReset }: CounterProps & { onReset: () => void }) {
  const [running, setRunning] = useState(true);
  const [intervalMs, setIntervalMs] = useState(1000);
  const count = useCounter(direction === "forward", { running, intervalMs });
  const title = `${direction === "forward" ? "Forward" : "Backward"} counter`;

  return (
    <>
      <div className="counter-heading">
        <div className="counter-identity">
          <span className="direction-icon" aria-hidden="true">{direction === "forward" ? "↗" : "↘"}</span>
          <div>
            <h3 id={`${direction}-title`}>{title}</h3>
            <p className="counter-description">{direction === "forward" ? "A little further, every tick." : "A step back, at your own pace."}</p>
          </div>
        </div>
        <span className={`status ${running ? "is-running" : ""}`}>
          <span aria-hidden="true" />{running ? "Running" : "Paused"}
        </span>
      </div>

      <div className="counter-display">
        <span className="value-label">CURRENT COUNT</span>
        <output className="counter-value" aria-label={`${title} value`} aria-live="off">{count}</output>
        <span className="step-label">{direction === "forward" ? "+1" : "−1"} per tick <span aria-hidden="true">·</span> independent state</span>
      </div>

      <div className="counter-settings">
        <label htmlFor={`${direction}-speed`}>Tick interval</label>
        <select id={`${direction}-speed`} value={intervalMs} onChange={(event) => setIntervalMs(Number(event.target.value))}>
          <option value={500}>0.5 seconds</option>
          <option value={1000}>1 second</option>
          <option value={2000}>2 seconds</option>
        </select>
      </div>
      <div className="counter-actions">
        <button className="toggle-button" type="button" aria-label={`${running ? "Pause" : "Resume"} ${direction} counter`} onClick={() => setRunning((value) => !value)}>
          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            {running ? <path d="M4 3h3v10H4zm5 0h3v10H9z" /> : <path d="m4 2 10 6-10 6z" />}
          </svg>
          {running ? "Pause counter" : "Resume counter"}
        </button>
        <button className="reset-button" type="button" aria-label={`Reset ${direction} counter`} onClick={onReset}>
          <span aria-hidden="true">↺</span> Reset
        </button>
      </div>
    </>
  );
}

export default function Counter({ direction }: CounterProps) {
  const [session, setSession] = useState(0);
  return (
    <section className={`counter-card counter-${direction}`} aria-labelledby={`${direction}-title`}>
      <CounterSession key={session} direction={direction} onReset={() => setSession((value) => value + 1)} />
    </section>
  );
}
