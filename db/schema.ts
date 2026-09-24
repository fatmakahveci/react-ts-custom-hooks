import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const workspaces = sqliteTable("workspaces", {
  owner: text("owner").primaryKey().notNull(),
  revision: integer("revision").notNull(),
  data: text("data").notNull(),
});
