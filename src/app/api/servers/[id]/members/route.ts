import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { memberships, users, userRoles, roles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const members = db
    .select({
      id: users.id,
      username: users.username,
      avatarUrl: users.avatarUrl,
      isBot: users.isBot,
    })
    .from(memberships)
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(eq(memberships.serverId, id))
    .all();

  const membersWithRoles = members.map((member) => {
    const memberRoles = db
      .select({
        id: roles.id,
        name: roles.name,
        color: roles.color,
        position: roles.position,
        permissions: roles.permissions,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(
        and(eq(userRoles.userId, member.id), eq(userRoles.serverId, id))
      )
      .all();

    return {
      ...member,
      roles: memberRoles.sort((a, b) => (b.position ?? 0) - (a.position ?? 0)),
    };
  });

  return NextResponse.json(membersWithRoles);
}
