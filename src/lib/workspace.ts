export type Task = {
  id: string;
  title: string;
  priority: "normal" | "high";
  done: boolean;
  createdAt: number;
};
export type Timer = {
  id: string;
  taskId: string | null;
  taskTitle: string;
  mode: "focus" | "break";
  durationMs: number;
  remainingMs: number;
  endsAt: number | null;
};
export type Session = { id: string; taskTitle: string; minutes: number; completedAt: number };
export type Workspace = { version: 1; tasks: Task[]; sessions: Session[]; timer: Timer | null };
export type Snapshot = { revision: number; data: Workspace };
export const EMPTY_WORKSPACE: Workspace = { version: 1, tasks: [], sessions: [], timer: null };
const record = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const text = (v: unknown, max: number): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max;
const number = (v: unknown): v is number =>
  typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
export function isWorkspace(v: unknown): v is Workspace {
  if (
    !record(v) ||
    v.version !== 1 ||
    !Array.isArray(v.tasks) ||
    !Array.isArray(v.sessions) ||
    v.tasks.length > 1000 ||
    v.sessions.length > 5000
  )
    return false;
  if (
    !v.tasks.every(
      (t) =>
        record(t) &&
        text(t.id, 80) &&
        text(t.title, 180) &&
        ["normal", "high"].includes(String(t.priority)) &&
        typeof t.done === "boolean" &&
        number(t.createdAt),
    )
  )
    return false;
  if (
    !v.sessions.every(
      (s) =>
        record(s) &&
        text(s.id, 80) &&
        text(s.taskTitle, 180) &&
        number(s.minutes) &&
        s.minutes > 0 &&
        s.minutes <= 60 &&
        number(s.completedAt),
    )
  )
    return false;
  if (
    new Set(v.tasks.map((t) => t.id)).size !== v.tasks.length ||
    new Set(v.sessions.map((s) => s.id)).size !== v.sessions.length
  )
    return false;
  if (v.timer === null) return true;
  const t = v.timer;
  return (
    record(t) &&
    text(t.id, 80) &&
    text(t.taskTitle, 180) &&
    ["focus", "break"].includes(String(t.mode)) &&
    number(t.durationMs) &&
    [300000, 900000, 1500000, 3000000].includes(t.durationMs) &&
    number(t.remainingMs) &&
    t.remainingMs <= t.durationMs &&
    (t.endsAt === null || number(t.endsAt)) &&
    (t.mode === "break"
      ? t.taskId === null
      : v.tasks.some((task) => task.id === t.taskId && !task.done))
  );
}
export const timeLeft = (timer: Timer, now: number) =>
  Math.max(0, timer.endsAt === null ? timer.remainingMs : timer.endsAt - now);
/** Deadlines survive suspended tabs; session IDs make completion idempotent. */
export function settleTimer(data: Workspace, now: number): Workspace {
  const timer = data.timer;
  if (!timer || timer.endsAt === null || timeLeft(timer, now) > 0) return data;
  const session: Session = {
    id: timer.id,
    taskTitle: timer.taskTitle,
    minutes: timer.durationMs / 60000,
    completedAt: timer.endsAt,
  };
  return {
    ...data,
    timer: null,
    sessions:
      timer.mode === "focus" && !data.sessions.some((s) => s.id === timer.id)
        ? [...data.sessions, session].slice(-5000)
        : data.sessions,
  };
}
export function sameDay(timestamp: number, now: number) {
  return new Date(timestamp).toDateString() === new Date(now).toDateString();
}
export function formatClock(ms: number) {
  const seconds = Math.ceil(ms / 1000);
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}
