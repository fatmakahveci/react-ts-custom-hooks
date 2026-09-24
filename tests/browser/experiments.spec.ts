import { expect, test } from "@playwright/test";

test("debounces rapid input and supports keyboard tab navigation", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.goto("/");
  await page.clock.pauseAt(new Date("2026-01-01T00:00:10Z"));
  await page.getByLabel("Type something").fill("react");
  await page.clock.runFor(499);
  await expect(page.getByLabel("Debounced value", { exact: true })).toHaveText("Nothing yet");
  await page.clock.runFor(1);
  await expect(page.getByLabel("Debounced value", { exact: true })).toHaveText("react");
  await page.getByRole("tab", { name: "useDebounce" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "useLocalStorage" })).toBeFocused();
  await expect(page.getByLabel("Your next note")).toBeVisible();
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "useMediaQuery" })).toBeFocused();
});

test("a saved note survives reload, synchronizes across tabs, and can be cleared", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "useLocalStorage" }).click();
  await page.getByLabel("Your next note").fill("Hooks share logic, not state.");
  await page.getByRole("button", { name: "Save note", exact: true }).click();
  await page.reload();
  await page.getByRole("tab", { name: "useLocalStorage" }).click();
  await expect(page.getByLabel("Saved note", { exact: true })).toHaveText(
    "Hooks share logic, not state.",
  );
  const other = await context.newPage();
  await other.goto("/");
  await other.getByRole("tab", { name: "useLocalStorage" }).click();
  await other.getByLabel("Your next note").fill("Updated in another tab");
  await other.getByRole("button", { name: "Save note", exact: true }).click();
  await expect(page.getByLabel("Saved note", { exact: true })).toHaveText("Updated in another tab");
  await page.getByRole("button", { name: "Clear saved note" }).click();
  await expect(other.getByLabel("Saved note", { exact: true })).toHaveText("No saved note");
});

test("media queries respond to viewport and preference changes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "useMediaQuery" }).click();
  await page.setViewportSize({ width: 1000, height: 900 });
  await expect(page.getByTestId("wide-result")).toHaveText("Matches");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByTestId("wide-result")).toHaveText("Does not match");
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await expect(page.getByRole("tabpanel").locator(".media-results dd").nth(1)).toHaveText(
    "Preferred",
  );
  await expect(page.getByRole("tabpanel").locator(".media-results dd").nth(2)).toHaveText(
    "Preferred",
  );
});
