import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(REFRESH_COOKIE)?.value;
  if (token) {
    await db.refreshToken.updateMany({ where: { token }, data: { revoked: true } });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
