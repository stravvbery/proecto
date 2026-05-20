import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { memberships } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { checkPermission } from "@/lib/auth/permissions";
import { recordEvent } from "@/lib/events";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { userId } = await params;
  const canBan = await checkPermission(
    session.userId,
    session.serverId,
    "manage_channels"
  );
  if (!canBan) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  db.delete(memberships)
    .where(
      and(
        eq(memberships.userId, userId),
        eq(memberships.serverId, session.serverId)
      )
    )
    .run();

  recordEvent(
    session.serverId,
    "member.banned",
    { userId },
    session.userId
  );

  return NextResponse.json({ ok: true }, { status: 201 });
}
