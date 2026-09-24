import { expect, test } from "@playwright/test";
async function add(page: import("@playwright/test").Page, title: string) {
  await page.getByLabel("What needs your attention?").fill(title);
  await page.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(page.getByRole("button", { name: title, exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start focus", exact: true })).toBeEnabled();
}

test("saves tasks through the real local API and retrieves them after reload", async ({ page }) => {
  await page.goto("/");
  const title = `Integration task ${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await add(page, title);
  await page.reload();
  await expect(page.getByRole("button", { name: title, exact: true })).toBeVisible();
  await page.getByRole("button", { name: `Delete ${title}`, exact: true }).click();
  await page.getByRole("button", { name: "Confirm delete", exact: true }).click();
  await expect(page.getByRole("button", { name: title, exact: true })).toHaveCount(0);
});
