import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionPayload } from "@/types";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "hondafx-legacy-dev-secret-2025"
);
const COOKIE_NAME = "session";

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export function verifyToken(token: string): Promise<SessionPayload | null> {
  return jwtVerify(token, secret)
    .then(({ payload }) => payload as unknown as SessionPayload)
    .catch(() => null);
}
