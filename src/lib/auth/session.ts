import { cookies } from "next/headers";
import { signToken, verifyToken } from "./jwt";
import type { SessionPayload } from "@/types";

export type { SessionPayload };

const COOKIE_NAME = "session";

export async function createSession(payload: SessionPayload): Promise<string> {
  return signToken(payload);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export { verifyToken };
