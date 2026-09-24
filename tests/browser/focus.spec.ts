import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { EMPTY_WORKSPACE, type Snapshot } from "../../src/lib/workspace";

test.beforeEach(async ({ context }) => {
  let state: Snapshot = structuredClone({ revision: 0, data: EMPTY_WORKSPACE });
  await context.route("**/api/workspace", async (route) => {
    if (route.request().method() === "PUT") {
      const incoming = route.request().postDataJSON() as Snapshot;
      if (incoming.revision !== state.revision) {
        await route.fulfill({
          status: 409,
          json: {
            error: "Workspace changed in another tab. Review the latest version and retry.",
            snapshot: state,
          },
        });
        return;
      }
      state = { revision: state.revision + 1, data: incoming.data };
    }
    await route.fulfill({ json: state });
  });
});
async function add(page: import("@playwright/test").Page, title: string) {
  await page.getByLabel("What needs your attention?").fill(title);
  await page.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(page.getByRole("button", { name: title, exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start focus", exact: true })).toBeEnabled();
}

test("creates, edits, searches, completes and deletes tasks with persistence", async ({ page }) => {
  await page.goto("/");
  await add(page, "Write the proposal");
  await page.reload();
  await expect(page.getByRole("button", { name: "Write the proposal", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit Write the proposal", exact: true }).click();
  await page.getByLabel("Edit task title").fill("Review the proposal");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.getByLabel("Search tasks").fill("unrelated");
  await expect(page.getByText("No matching tasks.", { exact: true })).toBeVisible();
  await page.getByLabel("Search tasks").fill("");
  await page.getByRole("checkbox", { name: "Complete Review the proposal", exact: true }).click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(
    page.getByRole("checkbox", { name: "Complete Review the proposal", exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Delete Review the proposal", exact: true }).click();
  await page.getByRole("button", { name: "Keep task", exact: true }).click();
  await expect(page.getByRole("checkbox")).toBeVisible();
  await page.getByRole("button", { name: "Delete Review the proposal", exact: true }).click();
  await page.getByRole("button", { name: "Confirm delete", exact: true }).click();
  await expect(page.getByRole("checkbox")).toHaveCount(0);
});

test("keeps a timer across reload, pauses, resumes, and records one completed session", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-09-24T10:00:00Z") });
  await page.goto("/");
  await page.clock.pauseAt(new Date("2026-09-24T10:00:10Z"));
  await add(page, "Draft the release notes");
  await page.getByRole("button", { name: "15 min", exact: true }).click();
  await page.getByRole("button", { name: "Start focus", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pause session", exact: true })).toBeEnabled();
  await page.clock.fastForward(60_000);
  await expect(page.getByRole("timer")).toHaveText("14:00");
  await page.reload();
  await expect(page.getByRole("timer")).toHaveText("14:00");
  await page.getByRole("button", { name: "Pause session", exact: true }).click();
  await expect(page.getByRole("button", { name: "Resume session", exact: true })).toBeEnabled();
  await page.clock.fastForward(60_000);
  await expect(page.getByRole("timer")).toHaveText("14:00");
  await page.getByRole("button", { name: "Resume session", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pause session", exact: true })).toBeEnabled();
  await page.clock.fastForward(840_000);
  await expect(page.locator(".session-list li")).toHaveCount(1);
  await expect(page.locator(".today-stats")).toContainText("15 min");
  await page.reload();
  await expect(page.locator(".session-list li")).toHaveCount(1);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export your data" }).click();
  expect((await download).suggestedFilename()).toBe("focus-desk-backup.json");
});

test("reports failed writes without claiming that a task was saved", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("What needs your attention?")).toBeEnabled();
  await page.route("**/api/workspace", (route) =>
    route.request().method() === "PUT"
      ? route.fulfill({ status: 503, json: { error: "Please retry." } })
      : route.fallback(),
  );
  await page.getByLabel("What needs your attention?").fill("Do not lose this draft");
  await page.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(page.locator(".desk-error")).toContainText("Please retry.");
  await expect(page.getByLabel("What needs your attention?")).toHaveValue("Do not lose this draft");
  await expect(page.locator(".task-list li")).toHaveCount(0);
});

test("has accessible empty and populated states without horizontal overflow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("What needs your attention?")).toBeEnabled();
  const scan = () =>
    new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect((await scan()).violations).toEqual([]);
  await add(
    page,
    "A very long task title that should wrap cleanly on a small phone without pushing its actions outside the visible area",
  );
  expect((await scan()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("link", { name: "Skip to tasks" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#tasks-title")).toBeFocused();
});
