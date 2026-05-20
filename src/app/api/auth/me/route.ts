import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { users, userRoles, roles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .get();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const userRoleRows = db
    .select({
      id: roles.id,
      name: roles.name,
      color: roles.color,
      position: roles.position,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(
      and(
        eq(userRoles.userId, session.userId),
        eq(userRoles.serverId, session.serverId)
      )
    )
    .all();

  return NextResponse.json({
    ...user,
    roles: userRoleRows,
    serverId: session.serverId,
  });
}
