import { StrictMode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import useCounter from "@/hooks/use-counter";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it("counts forward once per second and clears its timer on unmount", () => {
  const { result, unmount } = renderHook(() => useCounter());
  expect(result.current).toBe(0);
  act(() => vi.advanceTimersByTime(3000));
  expect(result.current).toBe(3);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it("changes direction without resetting state or duplicating timers", () => {
  const { result, rerender } = renderHook(({ forward }) => useCounter(forward), { initialProps: { forward: false } });
  act(() => vi.advanceTimersByTime(2000));
  expect(result.current).toBe(-2);
  rerender({ forward: true });
  act(() => vi.advanceTimersByTime(1000));
  expect(result.current).toBe(-1);
  expect(vi.getTimerCount()).toBe(1);
});

it("pauses, resumes, and replaces the interval when its speed changes", () => {
  const { result, rerender } = renderHook((options) => useCounter(true, options), { initialProps: { running: true, intervalMs: 500 } });
  act(() => vi.advanceTimersByTime(1000));
  expect(result.current).toBe(2);
  rerender({ running: false, intervalMs: 500 });
  expect(vi.getTimerCount()).toBe(0);
  act(() => vi.advanceTimersByTime(2000));
  expect(result.current).toBe(2);
  rerender({ running: true, intervalMs: 2000 });
  act(() => vi.advanceTimersByTime(1999));
  expect(result.current).toBe(2);
  act(() => vi.advanceTimersByTime(1));
  expect(result.current).toBe(3);
  rerender({ running: true, intervalMs: 500 });
  expect(vi.getTimerCount()).toBe(1);
  act(() => vi.advanceTimersByTime(500));
  expect(result.current).toBe(4);
});

it("keeps a single active timer in React Strict Mode", () => {
  const { result, unmount } = renderHook(() => useCounter(), { wrapper: StrictMode });
  expect(vi.getTimerCount()).toBe(1);
  act(() => vi.advanceTimersByTime(1000));
  expect(result.current).toBe(1);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it.each([0, -1, NaN, Infinity, 2_147_483_648])("rejects invalid timer delay %s", (intervalMs) => {
  const silence = vi.spyOn(console, "error").mockImplementation(() => {});
  const handleExpectedError = (event: ErrorEvent) => {
    if (event.error instanceof RangeError && event.error.message.startsWith("intervalMs")) {
      event.preventDefault();
    }
  };
  window.addEventListener("error", handleExpectedError);
  try {
    expect(() => renderHook(() => useCounter(true, { intervalMs }))).toThrow(RangeError);
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    window.removeEventListener("error", handleExpectedError);
    silence.mockRestore();
  }
});

it("updates the step without resetting state or creating additional timers", () => {
  const { result, rerender } = renderHook(({ step }) => useCounter(false, { step }), { initialProps: { step: 2 } });
  act(() => vi.advanceTimersByTime(2000));
  expect(result.current).toBe(-4);
  rerender({ step: 5 });
  act(() => vi.advanceTimersByTime(1000));
  expect(result.current).toBe(-9);
  expect(vi.getTimerCount()).toBe(1);
});
