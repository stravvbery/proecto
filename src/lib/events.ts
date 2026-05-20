import { db } from "@/lib/db/client";
import { events } from "@/lib/db/schema";
import { v4 as uuid } from "uuid";

export function recordEvent(
  serverId: string,
  type: string,
  data: Record<string, unknown>,
  actorId: string | null
) {
  const id = uuid();
  const now = new Date().toISOString();
  db.insert(events)
    .values({
      id,
      serverId,
      type,
      data: JSON.stringify(data),
      actorId,
      createdAt: now,
    })
    .run();
  return { id, serverId, type, data, actorId, createdAt: now };
}
