import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { StaffRole } from "@/lib/types/order";

export interface StaffSession {
  id: string;
  name: string;
  role: StaffRole;
  email: string;
}

const COOKIE = "staff_session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "ember-kitchen-demo-secret",
);

export async function createStaffSession(user: StaffSession) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret);

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function destroyStaffSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getStaffSession(): Promise<StaffSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as StaffSession;
  } catch {
    return null;
  }
}

export function verifyStaffSessionToken(token: string): StaffSession | null {
  try {
    // sync verify for middleware - use jwtVerify is async only
    return null;
  } catch {
    return null;
  }
}
