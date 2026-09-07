import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import useCounter from "../src/app/hooks/use-counter";

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });

it("counts forward once per second and clears its timer on unmount", () => {
  const { result, unmount } = renderHook(() => useCounter());
  expect(result.current).toBe(0);
  act(() => vi.advanceTimersByTime(3000));
  expect(result.current).toBe(3);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it("counts backwards and follows direction changes without duplicating timers", () => {
  const { result, rerender } = renderHook(({forward}) => useCounter(forward), {initialProps: {forward: false}});
  act(() => vi.advanceTimersByTime(2000));
  expect(result.current).toBe(-2);
  rerender({forward: true});
  act(() => vi.advanceTimersByTime(1000));
  expect(result.current).toBe(-1);
  expect(vi.getTimerCount()).toBe(1);
});
