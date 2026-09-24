"use client";

import { useId, useRef, useState } from "react";
import useDebounce from "@/hooks/use-debounce";
import useLocalStorage from "@/hooks/use-local-storage";
import useMediaQuery from "@/hooks/use-media-query";
import CodeExample from "@/components/code/code-example";

const tabs = [
  { id: "debounce", label: "useDebounce", description: "Wait for a pause" },
  { id: "storage", label: "useLocalStorage", description: "Remember a value" },
  { id: "media", label: "useMediaQuery", description: "Respond to the screen" },
] as const;
const isString = (value: unknown): value is string => typeof value === "string";

function DebounceExperiment() {
  const id = useId();
  const [text, setText] = useState("");
  const [delay, setDelay] = useState(500);
  const settled = useDebounce(text, delay);
  const pending = text !== settled;
  return (
    <div className="experiment-layout">
      <div>
        <p className="eyebrow">TIMING / useDebounce</p>
        <h3>Give your input a moment.</h3>
        <p className="experiment-copy">
          Type a few words. The settled value changes only after you stop typing for the chosen
          delay. No request is sent.
        </p>
        <label className="field-label" htmlFor={`${id}-input`}>
          Type something
        </label>
        <input
          id={`${id}-input`}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Try typing React hooks…"
          maxLength={200}
        />
        <label className="field-label" htmlFor={`${id}-delay`}>
          Debounce delay
        </label>
        <select
          id={`${id}-delay`}
          value={delay}
          onChange={(event) => setDelay(Number(event.target.value))}
        >
          <option value={250}>250 milliseconds</option>
          <option value={500}>500 milliseconds</option>
          <option value={1000}>1 second</option>
        </select>
      </div>
      <div>
        <div className="experiment-result">
          <span>Settled value</span>
          <output aria-label="Debounced value">{settled || "Nothing yet"}</output>
          <p role="status">{pending ? "Waiting for a pause…" : "Up to date"}</p>
        </div>
        <CodeExample
          code={`const settled = useDebounce(text, ${delay});`}
          label="Debounce example"
        />
      </div>
    </div>
  );
}

function StorageExperiment() {
  const id = useId();
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");
  const { value, setValue, remove, error } = useLocalStorage("hook-lab:note", "", isString);
  return (
    <div className="experiment-layout">
      <div>
        <p className="eyebrow">PERSISTENCE / useLocalStorage</p>
        <h3>A note that stays with you.</h3>
        <p className="experiment-copy">
          Save a short note, then reload. It stays in this browser and synchronizes across tabs.
          Nothing is uploaded.
        </p>
        <label className="field-label" htmlFor={`${id}-note`}>
          Your next note
        </label>
        <textarea
          id={`${id}-note`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="What did you learn about hooks?"
          maxLength={500}
          rows={3}
        />
        <div className="experiment-actions">
          <button
            type="button"
            onClick={() => setMessage(setValue(draft) ? "Note saved in this browser." : "")}
          >
            Save note
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              if (remove()) {
                setDraft("");
                setMessage("Saved note cleared.");
              }
            }}
          >
            Clear saved note
          </button>
        </div>
        <p className="experiment-feedback" role="status">
          {error || message}
        </p>
      </div>
      <div>
        <div className="experiment-result">
          <span>Saved in this browser</span>
          <output aria-label="Saved note">{value || "No saved note"}</output>
          <p>Reload the page to test persistence.</p>
        </div>
        <CodeExample
          code={
            'const { value, setValue, remove, error } =\n  useLocalStorage("hook-lab:note", "", isString);'
          }
          label="Storage example"
        />
      </div>
    </div>
  );
}

function MediaExperiment() {
  const wide = useMediaQuery("(min-width: 768px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const dark = useMediaQuery("(prefers-color-scheme: dark)");
  return (
    <div className="experiment-layout">
      <div>
        <p className="eyebrow">ENVIRONMENT / useMediaQuery</p>
        <h3>Let the browser tell you.</h3>
        <p className="experiment-copy">
          Resize the window or change your system preferences. These values update from media-query
          events, without polling.
        </p>
        <dl className="media-results">
          <div>
            <dt>Viewport ≥ 768px</dt>
            <dd data-testid="wide-result">{wide ? "Matches" : "Does not match"}</dd>
          </div>
          <div>
            <dt>Reduced motion</dt>
            <dd>{reducedMotion ? "Preferred" : "Not requested"}</dd>
          </div>
          <div>
            <dt>Dark color scheme</dt>
            <dd>{dark ? "Preferred" : "Not requested"}</dd>
          </div>
        </dl>
      </div>
      <div>
        <div
          className={`responsive-preview ${wide ? "is-wide" : ""}`}
          aria-label="Responsive layout example"
        >
          <span>Navigation</span>
          <span>Content adapts to your viewport</span>
        </div>
        <CodeExample
          code={'const wide = useMediaQuery("(min-width: 768px)");'}
          label="Media query example"
        />
      </div>
    </div>
  );
}

export default function HookExperiments() {
  const id = useId();
  const [active, setActive] = useState(0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  return (
    <section className="hook-experiments" aria-labelledby={`${id}-title`}>
      <div className="section-heading">
        <h2 id={`${id}-title`}>
          Beyond the counter<span>.</span>
        </h2>
        <span className="guide-caption">Three more hooks. Real browser behavior.</span>
      </div>
      <div className="experiment-tabs" role="tablist" aria-label="Hook experiments">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`${id}-${tab.id}`}
            aria-controls={`${id}-panel-${tab.id}`}
            aria-selected={active === index}
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={(event) => {
              let next = index;
              if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
              else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = tabs.length - 1;
              else return;
              event.preventDefault();
              setActive(next);
              buttons.current[next]?.focus();
            }}
          >
            <strong>{tab.label}</strong>
            <span>{tab.description}</span>
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${id}-panel-${tab.id}`}
          aria-labelledby={`${id}-${tab.id}`}
          hidden={active !== index}
          tabIndex={0}
        >
          {/* Mount only the selected experiment so hidden subscriptions and timers stop. */}
          {active === index &&
            (index === 0 ? (
              <DebounceExperiment />
            ) : index === 1 ? (
              <StorageExperiment />
            ) : (
              <MediaExperiment />
            ))}
        </div>
      ))}
    </section>
  );
}
