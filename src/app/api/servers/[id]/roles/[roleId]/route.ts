import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { roles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { checkPermission } from "@/lib/auth/permissions";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; roleId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, roleId } = await params;
  const canManage = await checkPermission(session.userId, id, "manage_channels");
  if (!canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.color !== undefined) updates.color = body.color;
  if (body.permissions !== undefined)
    updates.permissions = JSON.stringify(body.permissions);
  if (body.position !== undefined) updates.position = body.position;

  if (Object.keys(updates).length > 0) {
    db.update(roles).set(updates).where(eq(roles.id, roleId)).run();
  }

  const updated = db.select().from(roles).where(eq(roles.id, roleId)).get();
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; roleId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, roleId } = await params;
  const canManage = await checkPermission(session.userId, id, "manage_channels");
  if (!canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  db.delete(roles).where(eq(roles.id, roleId)).run();
  return NextResponse.json({ ok: true });
}
