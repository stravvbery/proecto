import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { categories } from "@/lib/db/schema";
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
  const cats = db
    .select()
    .from(categories)
    .where(eq(categories.serverId, id))
    .all();

  return NextResponse.json(cats);
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
  const catId = uuid();

  db.insert(categories)
    .values({
      id: catId,
      serverId: id,
      name: body.name,
      position: body.position || 0,
    })
    .run();

  const created = db.select().from(categories).where(eq(categories.id, catId)).get();
  return NextResponse.json(created, { status: 201 });
}
