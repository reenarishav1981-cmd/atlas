# Security Checklist — what's already implemented, and what to verify before launch

## Implemented in this codebase
- ✅ **Password hashing**: bcrypt with cost factor 12 (`src/lib/auth.ts`)
- ✅ **JWT auth**: short-lived access token (15 min) + rotating refresh token (30 days),
  both stored as `httpOnly`, `sameSite=strict`, `secure` (in prod) cookies — not localStorage,
  so they're invisible to XSS-injected JS.
- ✅ **Refresh token rotation + revocation**: old refresh token is revoked on every refresh
  and on logout, stored in DB so a stolen token can be invalidated.
- ✅ **Generic auth errors**: login/register never reveal whether an email exists, to block
  account enumeration.
- ✅ **Role-based access control**: CUSTOMER / ADMIN / SUPER_ADMIN enforced at two layers —
  `middleware.ts` (blocks before the request even reaches a page/route) and again inside each
  `/api/admin/*` route handler (defense in depth, survives a misconfigured middleware matcher).
- ✅ **Input validation everywhere**: every POST/PATCH body is parsed through a Zod schema
  (`src/lib/validations.ts`) before touching the database — rejects malformed/oversized/wrong-typed input.
- ✅ **Rate limiting**: login/register capped at 5/min/IP, checkout at 10/min, general API at 60/min
  (`src/lib/rateLimit.ts`, Upstash Redis in prod, in-memory fallback locally).
- ✅ **Security headers**: CSP, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy,
  Permissions-Policy set in both `middleware.ts` and `next.config.mjs`.
- ✅ **Server-side price/stock recalculation**: checkout never trusts a client-sent total or discount —
  it re-reads cart, product price, and coupon from the DB and recomputes everything.
- ✅ **Payment verification via webhook, not client callback**: `payment.captured` from Razorpay's
  webhook (HMAC-verified) is the only thing that marks an order PAID and decrements stock —
  a user closing the tab after paying, or a tampered client-side success callback, can't fake a paid order.
- ✅ **Idempotent webhook handling**: re-delivered webhook events don't double-decrement stock
  (`if (order.paymentStatus === "PAID") return` guard).
- ✅ **SQL injection**: not applicable — Prisma uses parameterized queries everywhere, no raw SQL in this codebase.
- ✅ **Soft deletes** on products (`isActive: false`) instead of hard deletes, so order history
  referencing a deleted product never breaks.

## You should verify / add before going live
- ⬜ **Email verification**: `emailVerified` field exists on `User` but no verification email flow
  is wired yet — add a token + `/api/auth/verify` route if you want to require it.
- ⬜ **Forgot password flow**: not included — add a reset-token table + `/api/auth/forgot-password`
  + `/api/auth/reset-password` routes (similar pattern to refresh tokens).
- ⬜ **CSRF**: cookies are `sameSite=strict`, which already blocks cross-site form/script submission
  in modern browsers. If you add any GET-based state-changing endpoint, convert it to POST.
- ⬜ **File upload validation**: if customers can upload anything (e.g. review images), validate
  file type/size server-side before sending to Supabase Storage — don't trust the `Content-Type` header alone.
- ⬜ **Admin action audit log**: consider a simple `AdminAuditLog` table that records who changed
  an order status or edited a product, with timestamp — useful once more than one admin has access.
- ⬜ **Dependency scanning**: run `npm audit` before each deploy, and keep Next.js/Prisma updated —
  most real-world Next.js CVEs get patched fast but only help you if you upgrade.
- ⬜ **Secrets rotation**: if `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` ever leak (e.g. committed to git
  by accident), rotating them immediately invalidates every existing session — good to know this is
  your kill switch.
- ⬜ **.env must never be committed.** Double-check `.gitignore` includes `.env` and `.env*.local`.
