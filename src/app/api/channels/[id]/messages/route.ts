import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { messages, users, userRoles, roles, channels } from "@/lib/db/schema";
import { eq, and, lt, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { v4 as uuid } from "uuid";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const url = new URL(req.url);
  const before = url.searchParams.get("before");
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);

  const query = db
    .select({
      id: messages.id,
      channelId: messages.channelId,
      userId: messages.userId,
      content: messages.content,
      editedAt: messages.editedAt,
      createdAt: messages.createdAt,
      username: users.username,
      avatarUrl: users.avatarUrl,
      isBot: users.isBot,
    })
    .from(messages)
    .leftJoin(users, eq(messages.userId, users.id))
    .where(
      before
        ? and(eq(messages.channelId, id), lt(messages.createdAt, before))
        : eq(messages.channelId, id)
    )
    .orderBy(desc(messages.createdAt))
    .limit(limit);

  const rows = query.all().reverse();

  const enriched = rows.map((row) => {
    let roleColor = "#b5bac1";
    if (row.userId) {
      const channel = db
        .select({ serverId: channels.serverId })
        .from(channels)
        .where(eq(channels.id, id))
        .get();

      if (channel) {
        const topRole = db
          .select({ color: roles.color, position: roles.position })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(
            and(
              eq(userRoles.userId, row.userId),
              eq(userRoles.serverId, channel.serverId)
            )
          )
          .all()
          .sort((a, b) => (b.position ?? 0) - (a.position ?? 0));

        if (topRole.length > 0) {
          roleColor = topRole[0].color || "#b5bac1";
        }
      }
    }

    return {
      id: row.id,
      channelId: row.channelId,
      userId: row.userId,
      content: row.content,
      editedAt: row.editedAt,
      createdAt: row.createdAt,
      user: row.userId
        ? {
            id: row.userId,
            username: row.username,
            avatarUrl: row.avatarUrl,
            isBot: row.isBot,
          }
        : null,
      roleColor,
    };
  });

  return NextResponse.json(enriched);
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
  const body = await req.json();
  const msgId = uuid();
  const now = new Date().toISOString();

  db.insert(messages)
    .values({
      id: msgId,
      channelId: id,
      userId: session.userId,
      content: body.content,
      createdAt: now,
    })
    .run();

  const user = db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .get();

  const channel = db
    .select({ serverId: channels.serverId })
    .from(channels)
    .where(eq(channels.id, id))
    .get();

  let roleColor = "#b5bac1";
  if (channel) {
    const topRole = db
      .select({ color: roles.color, position: roles.position })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(
        and(
          eq(userRoles.userId, session.userId),
          eq(userRoles.serverId, channel.serverId)
        )
      )
      .all()
      .sort((a, b) => (b.position ?? 0) - (a.position ?? 0));

    if (topRole.length > 0) {
      roleColor = topRole[0].color || "#b5bac1";
    }
  }

  return NextResponse.json(
    {
      id: msgId,
      channelId: id,
      userId: session.userId,
      content: body.content,
      createdAt: now,
      editedAt: null,
      user: user
        ? {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatarUrl,
            isBot: user.isBot,
          }
        : null,
      roleColor,
    },
    { status: 201 }
  );
}
