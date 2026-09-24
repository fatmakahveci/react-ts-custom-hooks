import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { handleWorkspace, jsonResponse, decodeRow, type WorkspaceStore } from "@/lib/workspace-api";
import {
  CREATE_WORKSPACES,
  READ_WORKSPACE,
  WRITE_WORKSPACE,
  UPDATE_WORKSPACE,
} from "../../../../db/statements";
export const dynamic = "force-dynamic";
let database: DatabaseSync | undefined;
function getStore(): WorkspaceStore {
  const path = resolve(
    /* turbopackIgnore: true */ process.env.FOCUS_DB_PATH || ".local/focus-desk.sqlite",
  );
  if (!database) {
    mkdirSync(dirname(path), { recursive: true });
    database = new DatabaseSync(path);
    database.exec(CREATE_WORKSPACES);
  }
  const db = database;
  return {
    async read(owner) {
      return decodeRow(
        db.prepare(READ_WORKSPACE).get(owner) as { revision: number; data: string } | null,
      );
    },
    async write(owner, revision, data) {
      const result =
        revision === 0
          ? db.prepare(WRITE_WORKSPACE).run(owner, JSON.stringify(data), revision, revision)
          : db.prepare(UPDATE_WORKSPACE).run(JSON.stringify(data), owner, revision);
      return Number(result.changes) === 1;
    },
  };
}
async function handler(request: Request) {
  // Local Next deployments are intentionally loopback-only. Sites uses its authenticated D1 worker.
  const origin = new URL(request.url);
  origin.host = request.headers.get("host") ?? origin.host;
  if (!["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname))
    return jsonResponse({ error: "Use the authenticated Sites deployment." }, 403);
  try {
    return await handleWorkspace(request, "local-owner", getStore(), origin.origin);
  } catch {
    return jsonResponse({ error: "Local database unavailable." }, 503);
  }
}
export { handler as GET, handler as PUT };
