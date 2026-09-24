import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import Counter from "@/components/counters/counter";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it("gives repeated counter instances unique labels and independent controls", () => {
  vi.useFakeTimers();
  render(<><Counter direction="forward" /><Counter direction="forward" /></>);
  const regions = screen.getAllByRole("region", { name: "Forward counter" });
  const first = within(regions[0]);
  const second = within(regions[1]);
  const firstInterval = first.getByLabelText("Tick interval");
  const secondInterval = second.getByLabelText("Tick interval");
  expect(firstInterval.id).not.toBe(secondInterval.id);
  fireEvent.change(firstInterval, { target: { value: "500" } });
  act(() => vi.advanceTimersByTime(1000));
  expect(first.getByLabelText("Forward counter value").textContent).toBe("2");
  expect(second.getByLabelText("Forward counter value").textContent).toBe("1");
  fireEvent.click(first.getByRole("button", { name: "Pause forward counter" }));
  expect(first.getByRole("status", { name: "Forward counter status" }).textContent).toBe("Paused");
  expect(second.getByRole("status", { name: "Forward counter status" }).textContent).toBe("Running");
});

it("applies presets, manually steps while paused, and exposes matching live code", () => {
  vi.useFakeTimers();
  render(<Counter direction="forward" />);
  const stepButton = screen.getByRole("button", { name: "Step forward counter" }) as HTMLButtonElement;
  expect(stepButton.disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Sprint" }));
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByLabelText("Forward counter value").textContent).toBe("10");
  fireEvent.click(screen.getByRole("button", { name: "Pause forward counter" }));
  expect(stepButton.disabled).toBe(false);
  fireEvent.change(screen.getByLabelText("Step size"), { target: { value: "2" } });
  fireEvent.click(stepButton);
  expect(screen.getByLabelText("Forward counter value").textContent).toBe("12");
  expect(vi.getTimerCount()).toBe(0);
  const code = screen.getByLabelText("Forward counter code").textContent;
  expect(code).toContain("running: false");
  expect(code).toContain("intervalMs: 500");
  expect(code).toContain("step: 2");
  fireEvent.click(screen.getByRole("button", { name: "Reset forward counter" }));
  expect(screen.getByLabelText("Forward counter value").textContent).toBe("0");
  expect((screen.getByLabelText("Step size") as HTMLSelectElement).value).toBe("1");
  expect(screen.getByRole("button", { name: "Steady" }).getAttribute("aria-pressed")).toBe("true");
});

it("preserves a paused count when applying a preset", () => {
  vi.useFakeTimers();
  render(<Counter direction="backward" />);
  act(() => vi.advanceTimersByTime(1000));
  fireEvent.click(screen.getByRole("button", { name: "Pause backward counter" }));
  fireEvent.click(screen.getByRole("button", { name: "Sprint" }));
  act(() => vi.advanceTimersByTime(2000));
  expect(screen.getByLabelText("Backward counter value").textContent).toBe("-1");
  expect(screen.getByRole("status", { name: "Backward counter status" }).textContent).toBe("Paused");
  expect(vi.getTimerCount()).toBe(0);
  fireEvent.click(screen.getByRole("button", { name: "Step backward counter" }));
  expect(screen.getByLabelText("Backward counter value").textContent).toBe("-6");
});

it("ignores manual step clicks while the timer is running", () => {
  vi.useFakeTimers();
  render(<Counter direction="forward" />);
  fireEvent.click(screen.getByRole("button", { name: "Step forward counter" }));
  expect(screen.getByLabelText("Forward counter value").textContent).toBe("0");
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByLabelText("Forward counter value").textContent).toBe("1");
});

it("clears an active preset when custom settings no longer match it", () => {
  vi.useFakeTimers();
  render(<Counter direction="forward" />);
  fireEvent.click(screen.getByRole("button", { name: "Sprint" }));
  fireEvent.change(screen.getByLabelText("Step size"), { target: { value: "2" } });
  const presets = within(screen.getByRole("group", { name: "Forward counter presets" }));
  expect(presets.getAllByRole("button").every((button) => button.getAttribute("aria-pressed") === "false")).toBe(true);
});
