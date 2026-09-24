import { cp, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
function run(entry, args, env = process.env) {
  const result = spawnSync(process.execPath, [entry, ...args], {
    cwd: root,
    env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("node_modules/next/dist/bin/next", ["build"], { ...process.env, SITES_EXPORT: "true" });
run("node_modules/vite/bin/vite.js", ["build", "--config", "vite.sites.config.mts"]);
await rm(new URL("../dist/client", import.meta.url), { force: true, recursive: true });
await cp(new URL("../out", import.meta.url), new URL("../dist/client", import.meta.url), {
  recursive: true,
});
