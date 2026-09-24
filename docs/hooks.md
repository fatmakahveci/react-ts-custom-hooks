# Reusable hooks

The interactive examples live at `/lab`.

## Using `useCounter`

Call the hook inside a client component or another hook:

```tsx
"use client";

import useCounter from "@/hooks/use-counter";

export default function CounterExample() {
  const forward = useCounter();
  const backward = useCounter(false);
  const fast = useCounter(true, { running: true, intervalMs: 500 });

  return (
    <div>
      <p>Forward: {forward}</p>
      <p>Backward: {backward}</p>
      <p>Fast: {fast}</p>
    </div>
  );
}
```

### API

```ts
useCounter(forwards?: boolean, options?: CounterOptions): number
```

| Parameter            | Default | Description                                                                                              |
| -------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `forwards`           | `true`  | Add `1` per tick. Set to `false` to subtract `1`.                                                        |
| `options.running`    | `true`  | Set to `false` to pause while retaining the current count.                                               |
| `options.step`       | `1`     | Positive safe integer added or subtracted per tick. Invalid values throw `RangeError`.                   |
| `options.intervalMs` | `1000`  | Finite delay between `1` and `2_147_483_647` milliseconds, inclusive. Invalid values throw `RangeError`. |

The returned number starts at `0`. Each hook call owns independent state.

### Timer Behavior

- Changing direction, step size, or interval preserves the count and replaces the active timer.
- Resuming starts a new interval; the next tick occurs after the full delay.
- Pausing or unmounting clears the timer.
- Reset in the demo restores the count, interval, step size, and running state without remounting controls, preserving keyboard focus.

Browser timers can be delayed, particularly in background tabs. The counter measures delivered ticks rather than elapsed wall-clock time.

Counter outputs have accessible labels and disable live announcements so screen readers are not interrupted on every tick.

### Explicit Controls

Use the named `useCounterController` export when a component needs reset or manual stepping:

```tsx
"use client";

import { useCounterController } from "@/hooks/use-counter";

export default function ManualCounter() {
  const { count, tick, reset } = useCounterController(true, {
    running: false,
    intervalMs: 1000,
    step: 5,
  });

  return (
    <div>
      <output aria-label="Manual counter value">{count}</output>
      <button onClick={tick}>Advance by five</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

`tick()` advances once in the configured direction, including while paused. `reset()` restores zero and restarts a full interval if running; it preserves the hook options. The demo additionally restores its UI settings. Manual stepping in the demo is disabled while running to make each action easy to observe.

The original default export still returns a number, so existing `useCounter()` calls remain valid. Both APIs share one timer implementation. Values use JavaScript numbers and are intended for small interactive experiments, not precision arithmetic beyond the safe-integer range.

## More Hooks

The **Explore more hooks** tabs provide three additional interactive examples:

| Hook                                            | Behavior                                                                                                                                                             |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useDebounce(value, delayMs)`                   | Returns the latest value after a quiet period; cleans up pending timers on changes and unmount. Delay must be finite and between 0 and 2,147,483,647 ms.             |
| `useLocalStorage(key, initialValue, validate?)` | Returns `{ value, setValue, remove, error }`; synchronizes hook instances and browser tabs with SSR-safe initial reads. Writes and removal return a success boolean. |
| `useMediaQuery(query, fallback?)`               | Tracks a media query and cleans up its listener; uses the fallback during server rendering and when matchMedia is unavailable.                                       |

Import these default exports from `@/hooks/use-debounce`, `@/hooks/use-local-storage`, and `@/hooks/use-media-query`. Pass a runtime validator to `useLocalStorage` when stored JSON must match a specific type. Malformed or rejected data returns the initial value and an error without silently overwriting the stored entry.

The note demo saves only when **Save note** is pressed. It stores text in this browser under `hook-lab:note`, survives reloads, and can be removed with **Clear saved note**. It does not upload notes or provide encrypted storage.
