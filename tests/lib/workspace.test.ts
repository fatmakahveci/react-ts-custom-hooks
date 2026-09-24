import { expect, it } from "vitest";
import {
  EMPTY_WORKSPACE,
  formatClock,
  isWorkspace,
  settleTimer,
  timeLeft,
  type Workspace,
} from "@/lib/workspace";
const active: Workspace = {
  ...EMPTY_WORKSPACE,
  tasks: [{ id: "task", title: "Ship the proposal", priority: "high", done: false, createdAt: 1 }],
  timer: {
    id: "session",
    taskId: "task",
    taskTitle: "Ship the proposal",
    mode: "focus",
    durationMs: 900000,
    remainingMs: 900000,
    endsAt: 900001,
  },
};
it("uses elapsed wall time and records completion once after a suspended tab", () => {
  expect(timeLeft(active.timer!, 100001)).toBe(800000);
  const finished = settleTimer(active, 900100);
  expect(finished.timer).toBeNull();
  expect(finished.sessions).toEqual([
    { id: "session", taskTitle: "Ship the proposal", minutes: 15, completedAt: 900001 },
  ]);
  expect(settleTimer(finished, 999999)).toBe(finished);
  expect(settleTimer({ ...active, sessions: finished.sessions }, 999999).sessions).toHaveLength(1);
});
it("keeps paused sessions paused and excludes breaks from focus totals", () => {
  const paused = { ...active, timer: { ...active.timer!, endsAt: null, remainingMs: 7000 } };
  expect(settleTimer(paused, 9999999)).toBe(paused);
  expect(timeLeft(paused.timer, 999999)).toBe(7000);
  expect(
    settleTimer({ ...active, timer: { ...active.timer!, mode: "break", taskId: null } }, 999999)
      .sessions,
  ).toEqual([]);
});
it("rejects malformed, duplicate, and orphaned workspace records", () => {
  expect(isWorkspace(active)).toBe(true);
  expect(isWorkspace(null)).toBe(false);
  expect(isWorkspace({ ...active, tasks: [active.tasks[0], active.tasks[0]] })).toBe(false);
  expect(isWorkspace({ ...active, tasks: [] })).toBe(false);
  expect(isWorkspace({ ...active, timer: { ...active.timer, endsAt: Infinity } })).toBe(false);
  expect(isWorkspace({ ...active, tasks: [{ ...active.tasks[0], done: true }] })).toBe(false);
});
it("rounds remaining time up and never displays an early zero", () => {
  expect(formatClock(1)).toBe("00:01");
  expect(formatClock(900000)).toBe("15:00");
});
