// @vitest-environment node
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, expect, it } from "vitest";
import worker from "../../sites/worker";
import { EMPTY_WORKSPACE } from "@/lib/workspace";
let db: DatabaseSync;
beforeEach(() => {
  db = new DatabaseSync(":memory:");
});
afterEach(() => db.close());
function statement(sql: string, values: (string | number)[] = []) {
  return {
    bind: (...v: (string | number)[]) => statement(sql, v),
    first: async <T>() => (db.prepare(sql).get(...values) ?? null) as T | null,
    run: async () => ({ meta: { changes: Number(db.prepare(sql).run(...values).changes) } }),
  };
}
const call = (
  owner: string | null,
  method = "GET",
  body?: unknown,
  origin = "https://example.test",
) =>
  worker.fetch(
    new Request("https://example.test/api/workspace", {
      method,
      headers: {
        ...(owner ? { "oai-authenticated-user-id": owner } : {}),
        "content-type": "application/json",
        origin,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
    {
      DB: { prepare: (sql: string) => statement(sql) },
      ASSETS: { fetch: async () => new Response("asset") },
    },
  );
it("requires identity and isolates each user's durable workspace", async () => {
  expect((await call(null)).status).toBe(401);
  const data = {
    ...EMPTY_WORKSPACE,
    tasks: [{ id: "a", title: "Private task", priority: "normal", done: false, createdAt: 1 }],
  };
  expect((await call("alice", "PUT", { revision: 0, data })).status).toBe(200);
  expect((await (await call("alice")).json()).data.tasks).toHaveLength(1);
  expect((await (await call("bob")).json()).data.tasks).toEqual([]);
});
it("rejects stale writes and preserves the newer revision", async () => {
  const first = await call("alice", "PUT", { revision: 0, data: EMPTY_WORKSPACE });
  expect(first.status).toBe(200);
  expect((await call("alice", "PUT", { revision: 1, data: EMPTY_WORKSPACE })).status).toBe(200);
  const conflict = await call("alice", "PUT", { revision: 1, data: EMPTY_WORKSPACE });
  expect(conflict.status).toBe(409);
  expect((await conflict.json()).snapshot.revision).toBe(2);
  expect((await call("alice", "PUT", { revision: 0, data: EMPTY_WORKSPACE })).status).toBe(409);
});
it("rejects cross-origin writes and malformed records", async () => {
  expect(
    (await call("alice", "PUT", { revision: 0, data: EMPTY_WORKSPACE }, "https://attacker.test"))
      .status,
  ).toBe(403);
  expect((await call("alice", "PUT", { revision: 0, data: { version: 2 } })).status).toBe(400);
  expect((await call("alice", "DELETE")).status).toBe(405);
});
it("does not replace corrupt stored data with an empty workspace", async () => {
  await call("alice");
  db.prepare("INSERT INTO workspaces VALUES (?, ?, ?)").run("alice", 1, "broken json");
  expect((await call("alice")).status).toBe(503);
  expect(
    (db.prepare("SELECT data FROM workspaces WHERE owner = ?").get("alice") as { data: string })
      ?.data,
  ).toBe("broken json");
});
