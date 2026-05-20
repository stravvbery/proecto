import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { channels } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { checkPermission } from "@/lib/auth/permissions";
import { recordEvent } from "@/lib/events";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; chId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, chId } = await params;
  const canManage = await checkPermission(session.userId, id, "manage_channels");
  if (!canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) {
    updates.name = body.name;
    recordEvent(id, "channel.renamed", { channelId: chId, name: body.name }, session.userId);
  }
  if (body.topic !== undefined) updates.topic = body.topic;
  if (body.categoryId !== undefined) updates.categoryId = body.categoryId;
  if (body.isImportant !== undefined) updates.isImportant = body.isImportant;

  if (Object.keys(updates).length > 0) {
    db.update(channels).set(updates).where(eq(channels.id, chId)).run();
  }

  const updated = db.select().from(channels).where(eq(channels.id, chId)).get();
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; chId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, chId } = await params;
  const canManage = await checkPermission(session.userId, id, "manage_channels");
  if (!canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const channel = db.select().from(channels).where(eq(channels.id, chId)).get();
  if (channel) {
    db.delete(channels).where(eq(channels.id, chId)).run();
    recordEvent(id, "channel.deleted", { channelId: chId, name: channel.name }, session.userId);
  }

  return NextResponse.json({ ok: true });
}
