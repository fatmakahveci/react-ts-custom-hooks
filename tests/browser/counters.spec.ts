import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.goto("/lab");
  await page.clock.pauseAt(new Date("2026-01-01T00:00:10Z"));
  await page.getByRole("button", { name: "Reset forward counter" }).click();
  await page.getByRole("button", { name: "Reset backward counter" }).click();
});

test("presets, pause, manual stepping, and reset remain independent", async ({ page }) => {
  const forward = page.getByRole("region", { name: "Forward counter", exact: true });
  const backward = page.getByRole("region", { name: "Backward counter", exact: true });
  await forward.getByRole("button", { name: "Sprint", exact: true }).click();
  await page.clock.runFor(1000);
  await expect(forward.getByLabel("Forward counter value", { exact: true })).toHaveText("10");
  await expect(backward.getByLabel("Backward counter value", { exact: true })).toHaveText("-1");
  await backward.getByRole("button", { name: "Pause backward counter" }).click();
  await backward.getByLabel("Step size").selectOption("5");
  await backward.getByRole("button", { name: "Step backward counter" }).click();
  await page.clock.runFor(1000);
  await expect(backward.getByLabel("Backward counter value", { exact: true })).toHaveText("-6");
  await expect(forward.getByLabel("Forward counter value", { exact: true })).toHaveText("20");
  const reset = backward.getByRole("button", { name: "Reset backward counter" });
  await reset.focus();
  await page.keyboard.press("Enter");
  await expect(reset).toBeFocused();
  await expect(backward.getByLabel("Step size")).toHaveValue("1");
  await expect(backward.getByLabel("Tick interval")).toHaveValue("1000");
});

test("live code follows the settings and supports clipboard feedback", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const counter = page.getByRole("region", { name: "Forward counter", exact: true });
  await counter.getByRole("button", { name: "Sprint", exact: true }).click();
  await counter.locator("summary").click();
  const code = counter.getByLabel("Forward counter code", { exact: true });
  await expect(code).toContainText("step: 5");
  await counter.getByRole("button", { name: "Copy Forward counter code" }).click();
  await expect(counter.getByText("Copied to clipboard.", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await code.textContent());
});

test("keyboard navigation skips to the counter controls", async ({ page }) => {
  await page.getByRole("link", { name: "Skip to counters" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#playground-title")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page
      .getByRole("region", { name: "Forward counter", exact: true })
      .getByRole("button", { name: "Steady", exact: true }),
  ).toBeFocused();
});

test("the page has no horizontal overflow or runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const size = await page.evaluate(() => ({
    width: innerWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(size.content).toBeLessThanOrEqual(size.width);
  expect(errors).toEqual([]);
});
