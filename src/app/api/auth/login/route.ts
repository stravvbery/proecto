import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { users, memberships } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const { username } = await req.json();
  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  const user = db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .get();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const membership = db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();

  const token = await createSession({
    userId: user.id,
    username: user.username,
    serverId: membership?.serverId || "srv-hondafx-legacy",
  });

  const response = NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      isBot: user.isBot,
    },
    token,
  });

  response.cookies.set("session", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
