import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import CodeExample from "@/components/code/code-example";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("copies the exact displayed configuration", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal("navigator", { clipboard: { writeText } });
  const code = "useCounter(true, { step: 5 });";
  render(<CodeExample code={code} label="Example" />);
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Copy Example" })));
  expect(writeText).toHaveBeenCalledWith(code);
  expect(screen.getByRole("status").textContent).toBe("Copied to clipboard.");
});

it("provides a manual-copy fallback when clipboard access is rejected", async () => {
  vi.stubGlobal("navigator", {
    clipboard: { writeText: vi.fn().mockRejectedValue(new Error("Denied")) },
  });
  render(<CodeExample code="const count = 0;" label="Example" />);
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Copy Example" })));
  expect(screen.getByRole("status").textContent).toContain("Select the code below");
  expect(screen.getByLabelText("Example").textContent).toBe("const count = 0;");
});

it("falls back gracefully when the clipboard API is unavailable", async () => {
  vi.stubGlobal("navigator", {});
  render(<CodeExample code="const count = 0;" label="Example" />);
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Copy Example" })));
  expect(screen.getByRole("status").textContent).toContain("Copy unavailable");
});

it("keeps feedback from the latest copy when an older request finishes last", async () => {
  let finishOlderRequest!: () => void;
  const olderRequest = new Promise<void>((resolve) => {
    finishOlderRequest = resolve;
  });
  const writeText = vi
    .fn()
    .mockReturnValueOnce(olderRequest)
    .mockRejectedValueOnce(new Error("Denied"));
  vi.stubGlobal("navigator", { clipboard: { writeText } });
  render(<CodeExample code="const count = 0;" label="Example" />);
  const copy = screen.getByRole("button", { name: "Copy Example" });
  fireEvent.click(copy);
  await act(async () => fireEvent.click(copy));
  expect(screen.getByRole("status").textContent).toContain("Copy unavailable");
  await act(async () => finishOlderRequest());
  expect(screen.getByRole("status").textContent).toContain("Copy unavailable");
});

it("clears previous feedback while a new copy request is pending", async () => {
  let finishCopy!: () => void;
  const pending = new Promise<void>((resolve) => {
    finishCopy = resolve;
  });
  const writeText = vi.fn().mockResolvedValueOnce(undefined).mockReturnValueOnce(pending);
  vi.stubGlobal("navigator", { clipboard: { writeText } });
  render(<CodeExample code="const count = 0;" label="Example" />);
  const copy = screen.getByRole("button", { name: "Copy Example" });
  await act(async () => fireEvent.click(copy));
  expect(screen.getByRole("status").textContent).toBe("Copied to clipboard.");
  fireEvent.click(copy);
  expect(screen.queryByRole("status")).toBeNull();
  await act(async () => finishCopy());
  expect(screen.getByRole("status").textContent).toBe("Copied to clipboard.");
});
