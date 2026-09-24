// @vitest-environment node
import { expect, it, vi } from "vitest";
import { handleWorkspace, type WorkspaceStore } from "@/lib/workspace-api";
import { EMPTY_WORKSPACE } from "@/lib/workspace";
const origin = "https://example.test";
const payload = JSON.stringify({ revision: 0, data: EMPTY_WORKSPACE });
function store() {
  return {
    read: vi.fn(async () => ({ revision: 0, data: EMPTY_WORKSPACE })),
    write: vi.fn<WorkspaceStore["write"]>(async () => true),
  };
}
function request(body: BodyInit = payload, headers: Record<string, string> = {}) {
  return new Request(`${origin}/api/workspace`, {
    method: "PUT",
    headers: { origin, "content-type": "application/json", ...headers },
    body,
    duplex: "half",
  } as RequestInit & { duplex: string });
}
it.each(["", "null", "https://attacker.test"])(
  "rejects an untrusted or missing write origin: %s",
  async (value) => {
    const db = store();
    const req = request();
    if (value) req.headers.set("origin", value);
    else req.headers.delete("origin");
    expect((await handleWorkspace(req, "alice", db)).status).toBe(403);
    expect(db.write).not.toHaveBeenCalled();
  },
);
it.each(["application/jsonp", "application/json-extra", "text/plain"])(
  "rejects a misleading content type: %s",
  async (type) => {
    const db = store();
    expect(
      (await handleWorkspace(request(payload, { "content-type": type }), "alice", db)).status,
    ).toBe(415);
    expect(db.write).not.toHaveBeenCalled();
  },
);
it("accepts JSON with a charset and returns non-cacheable, non-sniffable responses", async () => {
  const response = await handleWorkspace(
    request(payload, { "content-type": "application/json; charset=utf-8" }),
    "alice",
    store(),
  );
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(response.headers.get("x-content-type-options")).toBe("nosniff");
});
it("enforces the size limit in bytes, including multibyte JSON", async () => {
  const db = store();
  const body = JSON.stringify({
    revision: 0,
    data: { ...EMPTY_WORKSPACE, extra: "é".repeat(600000) },
  });
  expect(body.length).toBeLessThan(1_000_000);
  expect((await handleWorkspace(request(body), "alice", db)).status).toBe(413);
  expect(db.write).not.toHaveBeenCalled();
});
it("stops reading an oversized stream even with a false content length", async () => {
  let reads = 0;
  const cancel = vi.fn();
  const stream = new ReadableStream<Uint8Array>(
    {
      pull(controller) {
        reads++;
        if (reads <= 3) controller.enqueue(new Uint8Array(500001));
        else controller.close();
      },
      cancel,
    },
    { highWaterMark: 0 },
  );
  const db = store();
  expect(
    (await handleWorkspace(request(stream, { "content-length": "1" }), "alice", db)).status,
  ).toBe(413);
  expect(cancel).toHaveBeenCalled();
  expect(reads).toBe(2);
  expect(db.write).not.toHaveBeenCalled();
});
it("rejects declared oversize before consuming the body", async () => {
  let reads = 0;
  const stream = new ReadableStream<Uint8Array>(
    {
      pull(controller) {
        reads++;
        controller.close();
      },
    },
    { highWaterMark: 0 },
  );
  expect(
    (await handleWorkspace(request(stream, { "content-length": "1000001" }), "alice", store()))
      .status,
  ).toBe(413);
  expect(reads).toBe(0);
});
it("does not overflow the next revision", async () => {
  const db = store();
  expect(
    (
      await handleWorkspace(
        request(JSON.stringify({ revision: Number.MAX_SAFE_INTEGER, data: EMPTY_WORKSPACE })),
        "alice",
        db,
      )
    ).status,
  ).toBe(400);
  expect(db.write).not.toHaveBeenCalled();
});

it("accepts valid Unicode JSON split across byte boundaries", async () => {
  const bytes = new TextEncoder().encode(
    JSON.stringify({
      revision: 0,
      data: {
        ...EMPTY_WORKSPACE,
        tasks: [
          { id: "unicode", title: "Çalışma 🎯", priority: "normal", done: false, createdAt: 1 },
        ],
      },
    }),
  );
  let offset = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (offset < bytes.length) controller.enqueue(bytes.subarray(offset, ++offset));
      else controller.close();
    },
  });
  const db = store();
  expect((await handleWorkspace(request(stream), "alice", db)).status).toBe(200);
  expect(db.write.mock.calls[0][2].tasks[0].title).toBe("Çalışma 🎯");
});
it("rejects malformed UTF-8 instead of silently replacing bytes", async () => {
  const db = store();
  expect((await handleWorkspace(request(new Uint8Array([0xff])), "alice", db)).status).toBe(400);
  expect(db.write).not.toHaveBeenCalled();
});
