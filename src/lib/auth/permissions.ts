import { db } from "@/lib/db/client";
import { userRoles, roles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export type Permission =
  | "all"
  | "manage_channels"
  | "moderate"
  | "manage_roles_below"
  | "moderate_messages"
  | "help"
  | "vip_channels"
  | "basic"
  | "read_info";

const PERMISSION_HIERARCHY: Record<string, Permission[]> = {
  all: [
    "all",
    "manage_channels",
    "moderate",
    "manage_roles_below",
    "moderate_messages",
    "help",
    "vip_channels",
    "basic",
    "read_info",
  ],
  manage_channels: ["manage_channels"],
  moderate: ["moderate", "moderate_messages"],
  manage_roles_below: ["manage_roles_below"],
  moderate_messages: ["moderate_messages"],
  help: ["help"],
  vip_channels: ["vip_channels"],
  basic: ["basic", "read_info"],
  read_info: ["read_info"],
};

export async function getUserPermissions(
  userId: string,
  serverId: string
): Promise<Permission[]> {
  const userRoleRows = db
    .select({ permissions: roles.permissions })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(
      and(eq(userRoles.userId, userId), eq(userRoles.serverId, serverId))
    )
    .all();

  const perms = new Set<Permission>();
  for (const row of userRoleRows) {
    const parsed: string[] = JSON.parse(row.permissions || "[]");
    for (const p of parsed) {
      const expanded = PERMISSION_HIERARCHY[p] || [p as Permission];
      for (const ep of expanded) {
        perms.add(ep);
      }
    }
  }
  return Array.from(perms);
}

export async function checkPermission(
  userId: string,
  serverId: string,
  required: Permission
): Promise<boolean> {
  const perms = await getUserPermissions(userId, serverId);
  return perms.includes("all") || perms.includes(required);
}

export async function getUserHighestRole(
  userId: string,
  serverId: string
): Promise<{ position: number; name: string } | null> {
  const rows = db
    .select({ position: roles.position, name: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(
      and(eq(userRoles.userId, userId), eq(userRoles.serverId, serverId))
    )
    .all();

  if (rows.length === 0) return null;
  const sorted = rows.sort((a, b) => (b.position ?? 0) - (a.position ?? 0));
  return { position: sorted[0].position ?? 0, name: sorted[0].name };
}
