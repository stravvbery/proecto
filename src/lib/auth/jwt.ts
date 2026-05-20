import { SignJWT, jwtVerify } from "jose";

export interface SessionPayload {
  userId: string;
  username: string;
  serverId: string;
}

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "hondafx-legacy-dev-secret-2025"
);

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export function verifyToken(token: string): Promise<SessionPayload | null> {
  return jwtVerify(token, secret)
    .then(({ payload }) => payload as unknown as SessionPayload)
    .catch(() => null);
}
