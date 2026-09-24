import {
  COUNTER_PRESETS,
  INTERVAL_OPTIONS,
  STEP_OPTIONS,
  type CounterPreset,
  type CounterSettings,
} from "./counter-config";

interface CounterSettingsProps {
  id: string;
  title: string;
  sign: string;
  settings: CounterSettings;
  onChange: (settings: CounterSettings) => void;
  onPreset: (preset: CounterPreset) => void;
}

/** Controlled fields leave timer ownership with the counter, not its presentation. */
export default function CounterSettingsFields({
  id,
  title,
  sign,
  settings,
  onChange,
  onPreset,
}: CounterSettingsProps) {
  return (
    <>
      <div className="preset-row" role="group" aria-label={`${title} presets`}>
        <span className="preset-label">Quick start</span>
        {COUNTER_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            aria-pressed={
              settings.intervalMs === preset.intervalMs && settings.step === preset.step
            }
            onClick={() => onPreset(preset)}
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="counter-settings">
        <div className="setting-field">
          <label htmlFor={`${id}-interval`}>Tick interval</label>
          <select
            id={`${id}-interval`}
            value={settings.intervalMs}
            onChange={(event) => onChange({ ...settings, intervalMs: Number(event.target.value) })}
          >
            {INTERVAL_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="setting-field">
          <label htmlFor={`${id}-step`}>Step size</label>
          <select
            id={`${id}-step`}
            value={settings.step}
            onChange={(event) => onChange({ ...settings, step: Number(event.target.value) })}
          >
            {STEP_OPTIONS.map((value) => (
              <option key={value} value={value}>{sign}{value} per tick</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
