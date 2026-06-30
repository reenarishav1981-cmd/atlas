import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  cookieOptions,
  ACCESS_COOKIE,
  REFRESH_COOKIE,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(REFRESH_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "No session" }, { status: 401 });

  const payload = await verifyRefreshToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const stored = await db.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { id: payload.sub } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });

  // Rotate: revoke old, issue new (mitigates token replay)
  await db.refreshToken.update({ where: { token }, data: { revoked: true } });

  const sessionUser = { id: user.id, email: user.email, name: user.name, role: user.role };
  const newAccessToken = await signAccessToken(sessionUser);
  const newRefreshToken = await signRefreshToken(user.id);

  await db.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const response = NextResponse.json({ user: sessionUser });
  response.cookies.set(ACCESS_COOKIE, newAccessToken, cookieOptions(15 * 60));
  response.cookies.set(REFRESH_COOKIE, newRefreshToken, cookieOptions(30 * 24 * 60 * 60));
  return response;
}
