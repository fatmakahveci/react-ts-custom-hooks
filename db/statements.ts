export const CREATE_WORKSPACES =
  "CREATE TABLE IF NOT EXISTS workspaces (owner TEXT PRIMARY KEY NOT NULL, revision INTEGER NOT NULL, data TEXT NOT NULL)";
export const READ_WORKSPACE = "SELECT revision, data FROM workspaces WHERE owner = ?";
// The revision check prevents a stale tab or device from overwriting newer work.
export const WRITE_WORKSPACE =
  "INSERT INTO workspaces (owner, revision, data) SELECT ?, 1, ? WHERE ? = 0 ON CONFLICT(owner) DO UPDATE SET revision = workspaces.revision + 1, data = excluded.data WHERE workspaces.revision = ?";
export const UPDATE_WORKSPACE =
  "UPDATE workspaces SET revision = revision + 1, data = ? WHERE owner = ? AND revision = ?";
