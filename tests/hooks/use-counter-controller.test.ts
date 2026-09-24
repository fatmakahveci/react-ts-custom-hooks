import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useCounterController } from "@/hooks/use-counter";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it("supports manual steps and resets while paused without starting a timer", () => {
  const { result } = renderHook(() => useCounterController(false, { running: false, step: 5 }));
  act(() => {
    result.current.tick();
    result.current.tick();
  });
  expect(result.current.count).toBe(-10);
  act(() => result.current.reset());
  expect(result.current.count).toBe(0);
  expect(vi.getTimerCount()).toBe(0);
});

it("starts a full new interval on reset and cleans up on unmount", () => {
  const { result, unmount } = renderHook(() => useCounterController());
  act(() => vi.advanceTimersByTime(1900));
  expect(result.current.count).toBe(1);
  act(() => result.current.reset());
  act(() => vi.advanceTimersByTime(999));
  expect(result.current.count).toBe(0);
  act(() => vi.advanceTimersByTime(1));
  expect(result.current.count).toBe(1);
  expect(vi.getTimerCount()).toBe(1);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
  "rejects invalid step %s",
  (step) => {
    const silence = vi.spyOn(console, "error").mockImplementation(() => {});
    const handleExpectedError = (event: ErrorEvent) => {
      if (event.error instanceof RangeError && event.error.message.startsWith("step"))
        event.preventDefault();
    };
    window.addEventListener("error", handleExpectedError);
    try {
      expect(() => renderHook(() => useCounterController(true, { step }))).toThrow(RangeError);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      window.removeEventListener("error", handleExpectedError);
      silence.mockRestore();
    }
  },
);

it("does not restart the interval when a parent rerenders with equivalent options", () => {
  const { result, rerender } = renderHook(() => useCounterController(true, { intervalMs: 1000 }));
  act(() => vi.advanceTimersByTime(750));
  rerender();
  act(() => vi.advanceTimersByTime(250));
  expect(result.current.count).toBe(1);
  expect(vi.getTimerCount()).toBe(1);
});

it("restarts a full interval even when resetting a counter already at zero", () => {
  const { result } = renderHook(() => useCounterController());
  act(() => vi.advanceTimersByTime(750));
  act(() => result.current.reset());
  act(() => vi.advanceTimersByTime(999));
  expect(result.current.count).toBe(0);
  act(() => vi.advanceTimersByTime(1));
  expect(result.current.count).toBe(1);
});

it("uses the latest direction and step for manual ticks after reconfiguration", () => {
  const { result, rerender } = renderHook(
    ({ forwards, step }) => useCounterController(forwards, { running: false, step }),
    { initialProps: { forwards: true, step: 2 } },
  );
  act(() => result.current.tick());
  rerender({ forwards: false, step: 5 });
  act(() => {
    result.current.tick();
    result.current.tick();
  });
  expect(result.current.count).toBe(-8);
  expect(vi.getTimerCount()).toBe(0);
});
