"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Subscribe to a media query without reading browser globals during SSR. */
export default function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (notify: () => void) => {
      if (typeof window.matchMedia !== "function") return () => {};
      const media = window.matchMedia(query);
      media.addEventListener("change", notify);
      return () => media.removeEventListener("change", notify);
    },
    [query],
  );
  const snapshot = useCallback(
    () =>
      typeof window.matchMedia === "function" ? window.matchMedia(query).matches : serverValue,
    [query, serverValue],
  );
  // The server and first hydration render agree; React then reads the real viewport.
  return useSyncExternalStore(subscribe, snapshot, () => serverValue);
}
