import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { channels, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { checkPermission } from "@/lib/auth/permissions";
import { recordEvent } from "@/lib/events";
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
  const cats = db
    .select()
    .from(categories)
    .where(eq(categories.serverId, id))
    .all();

  const chs = db
    .select()
    .from(channels)
    .where(eq(channels.serverId, id))
    .all();

  const grouped = cats
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((cat) => ({
      category: cat,
      channels: chs
        .filter((ch) => ch.categoryId === cat.id)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    }));

  return NextResponse.json(grouped);
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
  const canManage = await checkPermission(
    session.userId,
    id,
    "manage_channels"
  );
  if (!canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const channelId = uuid();

  db.insert(channels)
    .values({
      id: channelId,
      categoryId: body.categoryId || null,
      serverId: id,
      name: body.name,
      topic: body.topic || null,
      type: body.type || "text",
      position: body.position || 0,
      isImportant: body.isImportant || false,
    })
    .run();

  recordEvent(id, "channel.created", { channelId, name: body.name }, session.userId);

  const channel = db
    .select()
    .from(channels)
    .where(eq(channels.id, channelId))
    .get();
  return NextResponse.json(channel, { status: 201 });
}
