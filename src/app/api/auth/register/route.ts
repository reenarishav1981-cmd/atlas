import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registerSchema, safeParse } from "@/lib/validations";
import {
  signAccessToken,
  signRefreshToken,
  cookieOptions,
  ACCESS_COOKIE,
  REFRESH_COOKIE,
} from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimit(ip, "auth");
  if (!success) {
    return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = safeParse(registerSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error }, { status: 400 });
  }

  const { name, email, phone, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    // Generic message — don't leak which emails are registered.
    return NextResponse.json({ error: "Unable to create account with these details." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: { name, email, phone, passwordHash, role: "CUSTOMER" },
  });

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

  sendWelcomeEmail(user.email, user.name).catch(() => {});

  const response = NextResponse.json({ user: sessionUser }, { status: 201 });
  response.cookies.set(ACCESS_COOKIE, accessToken, cookieOptions(15 * 60));
  response.cookies.set(REFRESH_COOKIE, refreshToken, cookieOptions(30 * 24 * 60 * 60));
  return response;
}
