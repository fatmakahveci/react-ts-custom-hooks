"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import type { SetStateAction } from "react";

const STORAGE_EVENT = "hook-lab:storage";
const UNAVAILABLE = Symbol("storage-unavailable");
const serverSnapshot = () => null;

type Validator<T> = (value: unknown) => value is T;

/** JSON-backed storage with SSR-safe reads, cross-tab updates, and explicit failures. */
export default function useLocalStorage<T>(key: string, initialValue: T, validate?: Validator<T>) {
  const [writeError, setWriteError] = useState<string | null>(null);
  const snapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return UNAVAILABLE;
    }
  }, [key]);
  const subscribe = useCallback(
    (notify: () => void) => {
      const onStorage = (event: StorageEvent) => {
        // A null key means clear(); it affects every subscribed item.
        if (event.key === null || event.key === key) notify();
      };
      const onLocalWrite = (event: Event) => {
        if ((event as CustomEvent<string>).detail === key) notify();
      };
      window.addEventListener("storage", onStorage);
      window.addEventListener(STORAGE_EVENT, onLocalWrite);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(STORAGE_EVENT, onLocalWrite);
      };
    },
    [key],
  );
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const decode = useCallback(
    (serialized: string | null | typeof UNAVAILABLE) => {
      if (serialized === UNAVAILABLE)
        return { value: initialValue, error: "Browser storage is unavailable." };
      if (serialized === null) return { value: initialValue, error: null };
      try {
        const value: unknown = JSON.parse(serialized);
        if (validate && !validate(value)) throw new Error("Unexpected data type");
        return { value: value as T, error: null };
      } catch {
        return {
          value: initialValue,
          error: "Saved data could not be read. Save a new value or clear it.",
        };
      }
    },
    [initialValue, validate],
  );
  const decoded = useMemo(() => decode(raw), [decode, raw]);

  const setValue = useCallback(
    (update: SetStateAction<T>): boolean => {
      try {
        const current = decode(snapshot()).value;
        const next =
          typeof update === "function" ? (update as (previous: T) => T)(current) : update;
        if (validate && !validate(next)) throw new Error("Unexpected data type");
        const serialized = JSON.stringify(next);
        if (serialized === undefined) throw new Error("The value is not JSON serializable");
        window.localStorage.setItem(key, serialized);
        // Native storage events fire only in other documents; notify this tab explicitly.
        window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: key }));
        setWriteError(null);
        return true;
      } catch {
        setWriteError("Could not save. Browser storage may be blocked or full.");
        return false;
      }
    },
    [decode, key, snapshot, validate],
  );

  const remove = useCallback((): boolean => {
    try {
      window.localStorage.removeItem(key);
      window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: key }));
      setWriteError(null);
      return true;
    } catch {
      setWriteError("Could not clear saved data. Browser storage may be blocked.");
      return false;
    }
  }, [key]);

  return { value: decoded.value, setValue, remove, error: writeError ?? decoded.error };
}
