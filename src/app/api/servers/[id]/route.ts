import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { servers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { checkPermission } from "@/lib/auth/permissions";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const server = db.select().from(servers).where(eq(servers.id, id)).get();
  if (!server) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 });
  }

  return NextResponse.json(server);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const canManage = await checkPermission(session.userId, id, "all");
  if (!canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.lore !== undefined) updates.lore = body.lore;
  if (body.iconUrl !== undefined) updates.iconUrl = body.iconUrl;

  if (Object.keys(updates).length > 0) {
    db.update(servers).set(updates).where(eq(servers.id, id)).run();
  }

  const updated = db.select().from(servers).where(eq(servers.id, id)).get();
  return NextResponse.json(updated);
}
