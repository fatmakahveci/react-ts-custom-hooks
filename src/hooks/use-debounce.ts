"use client";

import { useEffect, useState } from "react";

/** Emit the latest value after it stays unchanged for delayMs milliseconds. */
export default function useDebounce<T>(value: T, delayMs = 500): T {
  const [debounced, setDebounced] = useState<T>(() => value);
  if (!Number.isFinite(delayMs) || delayMs < 0 || delayMs > 2_147_483_647) {
    throw new RangeError("delayMs must be between 0 and 2147483647 milliseconds.");
  }

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(() => value), delayMs);
    // Replacing the value or delay cancels pending work, including on unmount.
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
