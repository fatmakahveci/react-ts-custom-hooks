"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { isWorkspace, type Snapshot, type Workspace } from "@/lib/workspace";
const validSnapshot = (v: Snapshot) =>
  Number.isSafeInteger(v.revision) && v.revision >= 0 && isWorkspace(v.data);
export default function useWorkspace() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const current = useRef<Snapshot | null>(null);
  const busy = useRef(false);
  const alive = useRef(true);
  const accept = useCallback((next: Snapshot) => {
    // A slower poll must never roll back a write that has already completed.
    if (alive.current && (!current.current || next.revision >= current.current.revision)) {
      current.current = next;
      setSnapshot(next);
    }
  }, []);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/workspace", {
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
      const body = await response.json();
      if (!response.ok || !validSnapshot(body))
        throw new Error(body.error || "Could not load your workspace.");
      accept(body);
      return true;
    } catch (e) {
      if (alive.current)
        setError(e instanceof Error ? e.message : "Could not connect. Please retry.");
      return false;
    }
  }, [accept]);
  useEffect(() => {
    alive.current = true;
    void refresh();
    const poll = setInterval(() => {
      if (!busy.current) void refresh();
    }, 5000);
    const onFocus = () => {
      if (!busy.current) void refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      alive.current = false;
      clearInterval(poll);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);
  const save = useCallback(
    async (update: (data: Workspace) => Workspace) => {
      if (!current.current || busy.current) return false;
      const previous = current.current;
      const data = update(previous.data);
      if (data === previous.data) return true;
      busy.current = true;
      setSaving(true);
      setError(null);
      try {
        const response = await fetch("/api/workspace", {
          method: "PUT",
          signal: AbortSignal.timeout(15000),
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ revision: previous.revision, data }),
        });
        const body = await response.json();
        if (response.status === 409 && body.snapshot && validSnapshot(body.snapshot))
          accept(body.snapshot);
        if (!response.ok || !validSnapshot(body))
          throw new Error(body.error || "Could not save. Your change has not been applied.");
        accept(body);
        return true;
      } catch (e) {
        if (alive.current)
          setError(e instanceof Error ? e.message : "Could not save. Please retry.");
        return false;
      } finally {
        busy.current = false;
        if (alive.current) setSaving(false);
      }
    },
    [accept],
  );
  const retry = useCallback(async () => {
    setError(null);
    return refresh();
  }, [refresh]);
  return { data: snapshot?.data ?? null, saving, error, save, retry };
}
