import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import useMediaQuery from "@/hooks/use-media-query";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("subscribes to browser changes and cleans up when the query changes", () => {
  const listeners = new Map<string, Set<() => void>>();
  const matches = new Map<string, boolean>();
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() {
      return matches.get(query) ?? false;
    },
    addEventListener: (_event: string, callback: () => void) => {
      if (!listeners.has(query)) listeners.set(query, new Set());
      listeners.get(query)!.add(callback);
    },
    removeEventListener: (_event: string, callback: () => void) =>
      listeners.get(query)?.delete(callback),
  }));
  const { result, rerender, unmount } = renderHook(({ query }) => useMediaQuery(query), {
    initialProps: { query: "(min-width: 768px)" },
  });
  expect(result.current).toBe(false);
  act(() => {
    matches.set("(min-width: 768px)", true);
    listeners.get("(min-width: 768px)")!.forEach((notify) => notify());
  });
  expect(result.current).toBe(true);
  rerender({ query: "(prefers-reduced-motion: reduce)" });
  expect(result.current).toBe(false);
  expect(listeners.get("(min-width: 768px)")!.size).toBe(0);
  unmount();
  expect(listeners.get("(prefers-reduced-motion: reduce)")!.size).toBe(0);
});

it("uses its fallback when matchMedia is unavailable", () => {
  vi.stubGlobal("matchMedia", undefined);
  const { result } = renderHook(() => useMediaQuery("(min-width: 768px)", true));
  expect(result.current).toBe(true);
});
