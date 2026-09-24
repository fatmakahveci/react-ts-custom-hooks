import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import useLocalStorage from "@/hooks/use-local-storage";

const isString = (value: unknown): value is string => typeof value === "string";
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

it("reads existing data without overwriting it and synchronizes hook instances", () => {
  localStorage.setItem("note", JSON.stringify("saved"));
  const first = renderHook(() => useLocalStorage("note", "", isString));
  const second = renderHook(() => useLocalStorage("note", "", isString));
  expect(first.result.current.value).toBe("saved");
  act(() => first.result.current.setValue((value) => `${value}!`));
  expect(second.result.current.value).toBe("saved!");
  act(() => second.result.current.remove());
  expect(first.result.current.value).toBe("");
  expect(localStorage.getItem("note")).toBeNull();
});

it("follows cross-tab writes and clear events", () => {
  const { result } = renderHook(() => useLocalStorage("note", "empty", isString));
  act(() => {
    localStorage.setItem("note", JSON.stringify("another tab"));
    window.dispatchEvent(new StorageEvent("storage", { key: "note" }));
  });
  expect(result.current.value).toBe("another tab");
  act(() => {
    localStorage.clear();
    window.dispatchEvent(new StorageEvent("storage", { key: null }));
  });
  expect(result.current.value).toBe("empty");
});

it.each(["broken json", "42"])("recovers from invalid stored data: %s", (raw) => {
  localStorage.setItem("note", raw);
  const { result } = renderHook(() => useLocalStorage("note", "fallback", isString));
  expect(result.current.value).toBe("fallback");
  expect(result.current.error).toContain("could not be read");
  act(() => result.current.setValue("repaired"));
  expect(result.current.value).toBe("repaired");
  expect(result.current.error).toBeNull();
});

it("reports blocked reads and failed writes without throwing", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("Blocked");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Quota");
  });
  const { result } = renderHook(() => useLocalStorage("note", "fallback", isString));
  expect(result.current.error).toContain("unavailable");
  act(() => expect(result.current.setValue("new")).toBe(false));
  expect(result.current.value).toBe("fallback");
  expect(result.current.error).toContain("Could not save");
});

it("resubscribes when the storage key changes", () => {
  localStorage.setItem("first", JSON.stringify("one"));
  localStorage.setItem("second", JSON.stringify("two"));
  const { result, rerender } = renderHook(({ key }) => useLocalStorage(key, "", isString), {
    initialProps: { key: "first" },
  });
  rerender({ key: "second" });
  expect(result.current.value).toBe("two");
  act(() => result.current.setValue("updated"));
  expect(localStorage.getItem("first")).toBe(JSON.stringify("one"));
  expect(localStorage.getItem("second")).toBe(JSON.stringify("updated"));
});
