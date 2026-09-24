import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { rename, writeFile } from "node:fs/promises";
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
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)],
  { cwd: root, stdio: "inherit" },
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
  const forward = page.getByRole("region", { name: "Forward counter", exact: true });
  const backward = page.getByRole("region", { name: "Backward counter", exact: true });
  await forward.getByRole("button", { name: "Reset forward counter" }).click();
  await backward.getByRole("button", { name: "Reset backward counter" }).click();
  await backward.getByRole("button", { name: "Reset backward counter" }).blur();
  const height = await page
    .locator(".playground-note")
    .evaluate((element) => Math.ceil(element.getBoundingClientRect().bottom + 20));
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

  async function advance(steps) {
    for (let index = 0; index < steps; index += 1) {
      await page.clock.runFor(500);
      await capture();
    }
  }

  // Virtual time gives every recording the same values and frame durations.
  await capture(1000);
  await advance(4);
  await forward.getByRole("button", { name: "Sprint", exact: true }).click();
  await capture(1000);
  await advance(4);
  assert.equal(
    await forward.getByLabel("Forward counter value", { exact: true }).textContent(),
    "22",
  );
  await backward.getByRole("button", { name: "Pause backward counter" }).click();
  await backward.getByLabel("Step size").selectOption("5");
  await capture(1000);
  await backward.getByRole("button", { name: "Step backward counter" }).click();
  await capture(1000);
  await backward.getByRole("button", { name: "Step backward counter" }).click();
  await capture(1000);
  await advance(3);
  assert.equal(
    await backward.getByLabel("Backward counter value", { exact: true }).textContent(),
    "-14",
  );
  await backward.getByRole("button", { name: "Resume backward counter" }).click();
  await advance(3);
  await forward.getByRole("button", { name: "Reset forward counter" }).click();
  await backward.getByRole("button", { name: "Reset backward counter" }).click();
  await backward.getByRole("button", { name: "Reset backward counter" }).blur();
  await capture(1500);
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
}
