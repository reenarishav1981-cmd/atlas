import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

const ADMIN_PREFIX = "/admin";
const ADMIN_API_PREFIX = "/api/admin";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // ── Security headers (applied to every response) ───────────────────────
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://images.unsplash.com https://*.supabase.co",
      "connect-src 'self' https://api.razorpay.com https://*.supabase.co wss://*",
      "frame-src https://api.razorpay.com",
    ].join("; ")
  );

  const { pathname } = req.nextUrl;

  // ── Protect /admin pages and /api/admin/* routes ────────────────────────
  if (pathname.startsWith(ADMIN_PREFIX) || pathname.startsWith(ADMIN_API_PREFIX)) {
    const user = await getUserFromRequest(req);

    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      if (pathname.startsWith(ADMIN_API_PREFIX)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and _next internals,
     * so headers apply broadly while staying cheap.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
