import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("the page and expanded controls have no WCAG A/AA violations", async ({ page }) => {
  await page.goto("/lab");
  await page.getByRole("button", { name: "Pause forward counter" }).click();
  await page.getByRole("button", { name: "Pause backward counter" }).click();
  const scan = () =>
    new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
  expect((await scan()).violations).toEqual([]);
  await page
    .getByRole("region", { name: "Forward counter", exact: true })
    .locator("summary")
    .click();
  expect((await scan()).violations).toEqual([]);
  for (const name of ["useDebounce", "useLocalStorage", "useMediaQuery"]) {
    await page.getByRole("tab", { name }).click();
    expect((await scan()).violations).toEqual([]);
  }
});

test("reduced motion removes control transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/lab");
  const duration = await page
    .getByRole("button", { name: "Pause forward counter" })
    .evaluate((button) => getComputedStyle(button).transitionDuration);
  expect(duration).toBe("0s");
});
