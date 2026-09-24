import { EMPTY_WORKSPACE, isWorkspace, type Snapshot, type Workspace } from "./workspace";
export interface WorkspaceStore {
  read(owner: string): Promise<Snapshot>;
  write(owner: string, revision: number, data: Workspace): Promise<boolean>;
}
export const jsonResponse = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      Vary: "Cookie, Origin",
    },
  });
const json = jsonResponse;
const MAX_BODY_BYTES = 1_000_000;
class BodyTooLarge extends Error {}

async function readBody(request: Request): Promise<string> {
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
    void request.body?.cancel().catch(() => {});
    throw new BodyTooLarge();
  }
  if (!request.body) return "";
  const reader = request.body.getReader();
  const buffer = new Uint8Array(MAX_BODY_BYTES);
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      // Use bounded storage even if the sender supplies many tiny chunks.
      if (bytes + value.byteLength > MAX_BODY_BYTES) throw new BodyTooLarge();
      buffer.set(value, bytes);
      bytes += value.byteLength;
    }
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer.subarray(0, bytes));
  } catch (error) {
    void reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
}

export async function handleWorkspace(
  request: Request,
  owner: string | null,
  store: WorkspaceStore,
  expectedOrigin = new URL(request.url).origin,
): Promise<Response> {
  if (!owner) return json({ error: "Sign in to open your workspace." }, 401);
  if (!["GET", "PUT"].includes(request.method)) return json({ error: "Method not allowed." }, 405);
  if (request.method === "PUT") {
    const origin = request.headers.get("origin");
    if (origin !== expectedOrigin || request.headers.get("sec-fetch-site") === "cross-site")
      return json({ error: "Cross-origin writes are not allowed." }, 403);
    if (
      request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !==
      "application/json"
    )
      return json({ error: "Expected JSON." }, 415);
  }
  try {
    if (request.method === "GET") return json(await store.read(owner));

    let body: { revision?: unknown; data?: unknown };
    try {
      body = JSON.parse(await readBody(request));
    } catch (error) {
      if (error instanceof BodyTooLarge) return json({ error: "Workspace is too large." }, 413);
      return json({ error: "Invalid JSON." }, 400);
    }
    if (
      !body ||
      !Number.isSafeInteger(body.revision) ||
      (body.revision as number) < 0 ||
      (body.revision as number) >= Number.MAX_SAFE_INTEGER ||
      !isWorkspace(body.data)
    )
      return json({ error: "Invalid workspace data." }, 400);
    if (!(await store.write(owner, body.revision as number, body.data)))
      return json(
        {
          error: "Workspace changed in another tab. Review the latest version and retry.",
          snapshot: await store.read(owner),
        },
        409,
      );
    return json({ revision: (body.revision as number) + 1, data: body.data });
  } catch {
    return json({ error: "Your workspace could not be saved or loaded. Please retry." }, 503);
  }
}
export function decodeRow(row: { revision: number; data: string } | null): Snapshot {
  if (!row) return { revision: 0, data: EMPTY_WORKSPACE };
  const data: unknown = JSON.parse(row.data);
  if (!isWorkspace(data)) throw new Error("Invalid stored workspace");
  return { revision: row.revision, data };
}
