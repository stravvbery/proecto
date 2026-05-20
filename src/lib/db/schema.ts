import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  avatarUrl: text("avatar_url"),
  isBot: integer("is_bot", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default("datetime('now')"),
});

export const servers = sqliteTable("servers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  ownerId: text("owner_id").references(() => users.id),
  lore: text("lore"),
  createdAt: text("created_at").default("datetime('now')"),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  serverId: text("server_id")
    .references(() => servers.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  position: integer("position").default(0),
});

export const channels = sqliteTable("channels", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  serverId: text("server_id")
    .references(() => servers.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  topic: text("topic"),
  type: text("type").default("text"),
  position: integer("position").default(0),
  isImportant: integer("is_important", { mode: "boolean" }).default(false),
});

export const roles = sqliteTable("roles", {
  id: text("id").primaryKey(),
  serverId: text("server_id")
    .references(() => servers.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  color: text("color").default("#b5bac1"),
  permissions: text("permissions").default("[]"),
  position: integer("position").default(0),
});

export const memberships = sqliteTable("memberships", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  serverId: text("server_id")
    .references(() => servers.id, { onDelete: "cascade" })
    .notNull(),
  joinedAt: text("joined_at").default("datetime('now')"),
});

export const userRoles = sqliteTable(
  "user_roles",
  {
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    roleId: text("role_id")
      .references(() => roles.id, { onDelete: "cascade" })
      .notNull(),
    serverId: text("server_id")
      .references(() => servers.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })]
);

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  channelId: text("channel_id")
    .references(() => channels.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  content: text("content").notNull(),
  editedAt: text("edited_at"),
  createdAt: text("created_at").default("datetime('now')"),
});

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  serverId: text("server_id")
    .references(() => servers.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type").notNull(),
  data: text("data").notNull(),
  actorId: text("actor_id").references(() => users.id),
  createdAt: text("created_at").default("datetime('now')"),
});

export const botMemories = sqliteTable("bot_memories", {
  id: text("id").primaryKey(),
  botId: text("bot_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  importance: integer("importance").default(5),
  createdAt: text("created_at").default("datetime('now')"),
});

export const mutes = sqliteTable("mutes", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  serverId: text("server_id")
    .references(() => servers.id, { onDelete: "cascade" })
    .notNull(),
  mutedBy: text("muted_by").references(() => users.id),
  reason: text("reason"),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").default("datetime('now')"),
});
