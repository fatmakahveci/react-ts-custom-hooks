import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import Home from "@/app/page";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it("runs independent counters and supports pause, speed changes, reset, and resume", () => {
  render(<Home />);
  const forward = () => screen.getByLabelText("Forward counter value").textContent;
  const backward = () => screen.getByLabelText("Backward counter value").textContent;
  expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Shared logic.");
  act(() => vi.advanceTimersByTime(2000));
  expect(forward()).toBe("2");
  expect(backward()).toBe("-2");
  fireEvent.click(screen.getByRole("button", { name: "Pause forward counter" }));
  fireEvent.change(screen.getAllByLabelText("Tick interval")[1], { target: { value: "500" } });
  act(() => vi.advanceTimersByTime(1000));
  expect(forward()).toBe("2");
  expect(backward()).toBe("-4");
  fireEvent.click(screen.getByRole("button", { name: "Resume forward counter" }));
  act(() => vi.advanceTimersByTime(1000));
  expect(forward()).toBe("3");
  fireEvent.click(screen.getByRole("button", { name: "Reset backward counter" }));
  expect(backward()).toBe("0");
  expect((screen.getAllByLabelText("Tick interval")[1] as HTMLSelectElement).value).toBe("1000");
  act(() => vi.advanceTimersByTime(1000));
  expect(forward()).toBe("4");
  expect(backward()).toBe("-1");
  expect(vi.getTimerCount()).toBe(2);
});

it("keeps keyboard focus on reset while restoring that counter's defaults", () => {
  render(<Home />);
  const reset = screen.getByRole("button", { name: "Reset forward counter" });
  fireEvent.change(screen.getAllByLabelText("Tick interval")[0], { target: { value: "500" } });
  act(() => vi.advanceTimersByTime(1500));
  fireEvent.click(screen.getByRole("button", { name: "Pause forward counter" }));
  reset.focus();
  fireEvent.click(reset);
  expect(document.activeElement).toBe(reset);
  expect(screen.getByLabelText("Forward counter value").textContent).toBe("0");
  expect((screen.getAllByLabelText("Tick interval")[0] as HTMLSelectElement).value).toBe("1000");
  expect(screen.getByRole("button", { name: "Pause forward counter" })).toBeTruthy();
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByLabelText("Forward counter value").textContent).toBe("1");
  expect(screen.getByLabelText("Backward counter value").textContent).toBe("-2");
});
