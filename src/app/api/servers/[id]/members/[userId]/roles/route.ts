import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { userRoles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { checkPermission } from "@/lib/auth/permissions";
import { recordEvent } from "@/lib/events";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, userId } = await params;
  const canManage = await checkPermission(session.userId, id, "manage_channels");
  if (!canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { roleId } = body;

  db.insert(userRoles)
    .values({ userId, roleId, serverId: id })
    .run();

  recordEvent(id, "role.assigned", { userId, roleId }, session.userId);

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, userId } = await params;
  const canManage = await checkPermission(session.userId, id, "manage_channels");
  if (!canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const roleId = url.searchParams.get("roleId");
  if (!roleId) {
    return NextResponse.json({ error: "roleId required" }, { status: 400 });
  }

  db.delete(userRoles)
    .where(
      and(
        eq(userRoles.userId, userId),
        eq(userRoles.roleId, roleId),
        eq(userRoles.serverId, id)
      )
    )
    .run();

  return NextResponse.json({ ok: true });
}
