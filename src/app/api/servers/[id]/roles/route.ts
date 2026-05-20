import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { roles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { checkPermission } from "@/lib/auth/permissions";
import { v4 as uuid } from "uuid";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const serverRoles = db
    .select()
    .from(roles)
    .where(eq(roles.serverId, id))
    .all();

  return NextResponse.json(serverRoles);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const canManage = await checkPermission(session.userId, id, "manage_channels");
  if (!canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const roleId = uuid();

  db.insert(roles)
    .values({
      id: roleId,
      serverId: id,
      name: body.name,
      color: body.color || "#b5bac1",
      permissions: JSON.stringify(body.permissions || ["basic"]),
      position: body.position || 0,
    })
    .run();

  const created = db.select().from(roles).where(eq(roles.id, roleId)).get();
  return NextResponse.json(created, { status: 201 });
}
