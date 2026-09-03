import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the page renders counters in both directions", async () => {
  const page = await readFile("src/app/page.tsx", "utf8");

  assert.match(page, /<ForwardCounter/);
  assert.match(page, /<BackwardCounter/);
});

test("the counter hook starts and cleans up its interval", async () => {
  const hook = await readFile("src/app/hooks/use-counter.tsx", "utf8");

  assert.match(hook, /setInterval/);
  assert.match(hook, /clearInterval/);
  assert.match(hook, /forward/);
});
