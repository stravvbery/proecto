import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { messages, channels } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { checkPermission } from "@/lib/auth/permissions";
import { recordEvent } from "@/lib/events";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; msgId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, msgId } = await params;
  const channel = db
    .select({ serverId: channels.serverId })
    .from(channels)
    .where(eq(channels.id, id))
    .get();

  if (!channel) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  const canEdit = await checkPermission(
    session.userId,
    channel.serverId,
    "all"
  );
  if (!canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const now = new Date().toISOString();

  db.update(messages)
    .set({ content: body.content, editedAt: now })
    .where(eq(messages.id, msgId))
    .run();

  const updated = db.select().from(messages).where(eq(messages.id, msgId)).get();
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; msgId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, msgId } = await params;
  const channel = db
    .select({ serverId: channels.serverId })
    .from(channels)
    .where(eq(channels.id, id))
    .get();

  if (!channel) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  const canDelete = await checkPermission(
    session.userId,
    channel.serverId,
    "moderate_messages"
  );
  if (!canDelete) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  db.delete(messages).where(eq(messages.id, msgId)).run();
  recordEvent(
    channel.serverId,
    "message.deleted",
    { messageId: msgId, channelId: id },
    session.userId
  );

  return NextResponse.json({ ok: true });
}
