import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { mutes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { checkPermission } from "@/lib/auth/permissions";
import { recordEvent } from "@/lib/events";
import { v4 as uuid } from "uuid";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { userId } = await params;
  const canMod = await checkPermission(
    session.userId,
    session.serverId,
    "moderate_messages"
  );
  if (!canMod) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const now = new Date().toISOString();
  let expiresAt: string | null = null;

  if (body.duration) {
    const d = new Date();
    d.setMinutes(d.getMinutes() + body.duration);
    expiresAt = d.toISOString();
  }

  db.insert(mutes)
    .values({
      id: uuid(),
      userId,
      serverId: session.serverId,
      mutedBy: session.userId,
      reason: body.reason || null,
      expiresAt,
      createdAt: now,
    })
    .run();

  recordEvent(
    session.serverId,
    "member.muted",
    { userId, reason: body.reason, duration: body.duration },
    session.userId
  );

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { userId } = await params;
  const canMod = await checkPermission(
    session.userId,
    session.serverId,
    "moderate_messages"
  );
  if (!canMod) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  db.delete(mutes)
    .where(
      and(eq(mutes.userId, userId), eq(mutes.serverId, session.serverId))
    )
    .run();

  return NextResponse.json({ ok: true });
}
