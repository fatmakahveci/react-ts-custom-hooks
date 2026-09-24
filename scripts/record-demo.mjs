import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { rename, writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import gifenc from "gifenc";
import sharp from "sharp";

const { GIFEncoder, quantize, applyPalette } = gifenc;
const root = fileURLToPath(new URL("../", import.meta.url));
const port = 4174;
const origin = `http://127.0.0.1:${port}`;
const target = new URL("../demo.gif", import.meta.url);
const temporary = new URL("../demo.pending.gif", import.meta.url);
const databaseDirectory = await mkdtemp(join(tmpdir(), "focus-demo-"));
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)],
  {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, FOCUS_DB_PATH: join(databaseDirectory, "demo.sqlite") },
  },
);
let browser;

try {
  // Own the server lifecycle so this command never records a stale development build.
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (server.exitCode !== null) throw new Error("The demo server exited before recording.");
    try {
      ready = (await fetch(origin, { signal: AbortSignal.timeout(1000) })).ok;
    } catch {
      /* The server is still starting. */
    }
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(ready, "The demo server did not become ready.");
  browser = await chromium.launch({
    channel: process.env.PLAYWRIGHT_CHROMIUM_CHANNEL || undefined,
  });
  const page = await browser.newPage({ viewport: { width: 1100, height: 1700 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.clock.pauseAt(new Date("2026-01-01T00:00:10Z"));
  const height = 1080;
  const gif = GIFEncoder();
  let frames = 0;

  async function capture(delay = 500) {
    await page.mouse.move(1090, 1690);
    const png = await page.screenshot({ clip: { x: 0, y: 0, width: 1100, height } });
    const { data, info } = await sharp(png)
      .resize({ width: 960 })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const palette = quantize(data, 256);
    gif.writeFrame(applyPalette(data, palette), info.width, info.height, {
      palette,
      delay,
      repeat: 0,
    });
    frames += 1;
  }

  // Record the real task-to-focus workflow against an isolated local database.
  await capture(1200);
  await page.getByLabel("What needs your attention?").fill("Outline the project proposal");
  await capture(800);
  await page.getByRole("button", { name: "Add task", exact: true }).click();
  await page.getByRole("button", { name: "Outline the project proposal", exact: true }).waitFor();
  await capture(1200);
  await page.getByLabel("What needs your attention?").fill("Review the pull request");
  await page.getByLabel("Priority", { exact: true }).selectOption("high");
  await page.getByRole("button", { name: "Add task", exact: true }).click();
  await page.getByRole("button", { name: "Review the pull request", exact: true }).waitFor();
  await capture(1000);
  await page.getByRole("button", { name: "Outline the project proposal", exact: true }).click();
  await page.getByRole("button", { name: "15 min", exact: true }).click();
  await capture(1000);
  await page.getByRole("button", { name: "Start focus", exact: true }).click();
  await page.getByRole("button", { name: "Pause session", exact: true }).waitFor();
  await capture(1000);
  await page.clock.fastForward(60000);
  await capture(1000);
  await page.getByRole("button", { name: "Pause session", exact: true }).click();
  await page.getByRole("button", { name: "Resume session", exact: true }).waitFor();
  await capture(1000);
  await page.getByRole("button", { name: "Resume session", exact: true }).click();
  await page.getByRole("button", { name: "Pause session", exact: true }).waitFor();
  await page.clock.fastForward(840000);
  await page.locator(".session-list li").waitFor();
  await capture(1800);
  await page
    .getByRole("checkbox", { name: "Complete Outline the project proposal", exact: true })
    .click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Complete Outline the project proposal", exact: true })
    .waitFor();
  await capture(1800);
  assert.deepEqual(errors, [], "The recording must not contain browser errors.");
  gif.finish();
  // Keep the previous published GIF intact if capture or encoding fails.
  await writeFile(temporary, gif.bytes());
  await rename(temporary, target);
  console.log(`Recorded demo.gif: ${frames} frames at 960px wide.`);
} finally {
  await browser?.close();
  if (server.exitCode === null) {
    const stopped = once(server, "exit");
    server.kill("SIGTERM");
    await stopped;
  }
  await rm(databaseDirectory, { recursive: true, force: true });
}
