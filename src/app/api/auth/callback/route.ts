import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import { signAccessToken, signRefreshToken, ACCESS_COOKIE, REFRESH_COOKIE, cookieOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=No+code+provided", req.url));
  }

  // Initialize a server-side client to exchange code
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error?.message || "Exchange failed")}`, req.url));
  }

  const { email, user_metadata } = data.user;
  if (!email) {
    return NextResponse.redirect(new URL("/login?error=No+email+returned+from+Google", req.url));
  }

  // Find or create user in our Postgres DB
  let user = await db.user.findUnique({ where: { email } });
  if (!user) {
    user = await db.user.create({
      data: {
        email,
        name: user_metadata.full_name || user_metadata.name || email.split("@")[0],
        passwordHash: "", // OAuth users do not have a local password hash
        role: "CUSTOMER",
      },
    });
  }

  // Sign custom JWT tokens
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const accessToken = await signAccessToken(payload);
  const refreshToken = await signRefreshToken(user.id);

  // Set the response cookies
  const response = NextResponse.redirect(new URL("/", req.url));
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, accessToken, cookieOptions(900)); // 15m
  cookieStore.set(REFRESH_COOKIE, refreshToken, cookieOptions(30 * 24 * 60 * 60)); // 30d

  return response;
}
