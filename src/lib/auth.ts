import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
};

const ACCESS_TTL = "15m";
const REFRESH_TTL_DAYS = 30;



export async function signAccessToken(user: SessionUser) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TTL_DAYS}d`)
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as unknown as { sub: string };
  } catch {
    return null;
  }
}

// Cookie config — httpOnly + secure + sameSite=strict (per project security pattern)
export const ACCESS_COOKIE = "atlas_at";
export const REFRESH_COOKIE = "atlas_rt";

export function cookieOptions(maxAgeSeconds: number) {
  const isProd = process.env.NODE_ENV === "production";
  const isLocal = process.env.NEXT_PUBLIC_SITE_URL?.includes("localhost") || false;
  return {
    httpOnly: true,
    secure: isProd && !isLocal,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** Read & verify the current user from request cookies (use inside Route Handlers / Server Components). */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}

/** Variant for middleware.ts where `cookies()` from next/headers works differently */
export async function getUserFromRequest(req: NextRequest): Promise<SessionUser | null> {
  const token = req.cookies.get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}

export function requireRole(user: SessionUser | null, roles: SessionUser["role"][]) {
  if (!user) return false;
  return roles.includes(user.role);
}
