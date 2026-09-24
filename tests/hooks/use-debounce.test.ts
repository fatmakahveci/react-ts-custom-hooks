import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import useDebounce from "@/hooks/use-debounce";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it("emits only the latest value after a quiet interval", () => {
  const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
    initialProps: { value: "" },
  });
  rerender({ value: "r" });
  act(() => vi.advanceTimersByTime(300));
  rerender({ value: "react" });
  act(() => vi.advanceTimersByTime(499));
  expect(result.current).toBe("");
  act(() => vi.advanceTimersByTime(1));
  expect(result.current).toBe("react");
});

it("restarts when the delay changes and cancels pending work on unmount", () => {
  const { result, rerender, unmount } = renderHook(
    ({ value, delay }) => useDebounce(value, delay),
    { initialProps: { value: "first", delay: 500 } },
  );
  rerender({ value: "next", delay: 500 });
  act(() => vi.advanceTimersByTime(300));
  rerender({ value: "next", delay: 1000 });
  act(() => vi.advanceTimersByTime(999));
  expect(result.current).toBe("first");
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it("treats function values as data rather than state updaters", () => {
  const first = vi.fn();
  const second = vi.fn();
  const { result, rerender } = renderHook(({ value }) => useDebounce(value, 0), {
    initialProps: { value: first },
  });
  rerender({ value: second });
  act(() => vi.runAllTimers());
  expect(result.current).toBe(second);
  expect(first).not.toHaveBeenCalled();
  expect(second).not.toHaveBeenCalled();
});
