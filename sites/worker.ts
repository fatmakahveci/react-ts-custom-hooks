import {
  handleWorkspace,
  jsonResponse,
  decodeRow,
  type WorkspaceStore,
} from "../src/lib/workspace-api";
import {
  CREATE_WORKSPACES,
  READ_WORKSPACE,
  WRITE_WORKSPACE,
  UPDATE_WORKSPACE,
} from "../db/statements";
interface Statement {
  bind(...values: (string | number)[]): Statement;
  first<T>(): Promise<T | null>;
  run(): Promise<{ meta: { changes: number } }>;
}
interface SiteEnvironment {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  DB: { prepare(sql: string): Statement };
}
const worker = {
  async fetch(request: Request, env: SiteEnvironment) {
    if (new URL(request.url).pathname !== "/api/workspace") return env.ASSETS.fetch(request);
    const owner = request.headers.get("oai-authenticated-user-id");
    if (!owner) return jsonResponse({ error: "Sign in to open your workspace." }, 401);
    const store: WorkspaceStore = {
      async read(user) {
        await env.DB.prepare(CREATE_WORKSPACES).run();
        return decodeRow(
          await env.DB.prepare(READ_WORKSPACE)
            .bind(user)
            .first<{ revision: number; data: string }>(),
        );
      },
      async write(user, revision, data) {
        await env.DB.prepare(CREATE_WORKSPACES).run();
        const statement =
          revision === 0
            ? env.DB.prepare(WRITE_WORKSPACE).bind(user, JSON.stringify(data), revision, revision)
            : env.DB.prepare(UPDATE_WORKSPACE).bind(JSON.stringify(data), user, revision);
        return (await statement.run()).meta.changes === 1;
      },
    };
    return handleWorkspace(request, owner, store);
  },
};
export default worker;
