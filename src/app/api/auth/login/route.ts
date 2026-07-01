import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loginSchema, safeParse } from "@/lib/validations";
import {
  signAccessToken,
  signRefreshToken,
  cookieOptions,
  ACCESS_COOKIE,
  REFRESH_COOKIE,
} from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimit(ip, "auth");
  if (!success) {
    return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = safeParse(loginSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  // Generic error for both "no such user" and "wrong password" — prevents user enumeration.
  const genericError = () => NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  const user = await db.user.findUnique({ where: { email } });
  if (!user) return genericError();

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return genericError();

  const sessionUser = { id: user.id, email: user.email, name: user.name, role: user.role };
  const accessToken = await signAccessToken(sessionUser);
  const refreshToken = await signRefreshToken(user.id);

  await db.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const response = NextResponse.json({ user: sessionUser });
  response.cookies.set(ACCESS_COOKIE, accessToken, cookieOptions(15 * 60));
  response.cookies.set(REFRESH_COOKIE, refreshToken, cookieOptions(30 * 24 * 60 * 60));
  return response;
}
