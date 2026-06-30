# ATLAS Commerce OS — Full Backend

This is the production backend layer for your Figma Make "ATLAS Commerce OS" frontend prototype —
real auth, real database, real payments, real admin, SEO, and security, ready to wire to your
existing UI components.

## What's in here
```
prisma/schema.prisma        → full DB schema (User, Product, Order, Cart, Review, Coupon, ...)
prisma/seed.ts               → creates your first admin user + sample product
src/middleware.ts            → security headers + blocks /admin & /api/admin for non-admins
src/lib/
  auth.ts                    → JWT sign/verify, password hashing, session helpers
  db.ts                      → Prisma client singleton
  validations.ts             → every input shape, validated with Zod
  rateLimit.ts                → login/checkout/API rate limiting
  razorpay.ts                 → order creation + signature verification
  email.ts                    → Resend transactional emails
  supabase.ts                  → Storage client for product images
src/app/api/
  auth/{register,login,logout,refresh,me}
  products/, products/[slug]/
  cart/, wishlist/, reviews/, newsletter/, coupons/validate/
  checkout/                  → server-recalculated totals, creates Razorpay order or confirms COD
  webhooks/razorpay/         → the ONLY place an order gets marked PAID
  admin/{stats,orders,products,customers}
src/app/
  admin/page.tsx + _components/AdminDashboard.tsx   → FIXED, fully wired admin panel
  login/, register/                                  → real auth forms
  products/[slug]/page.tsx                            → SSR + JSON-LD for SEO
  sitemap.ts, robots.ts                               → SEO
SETUP_SUPABASE.md            → do this first
SETUP_MONGODB_ATLAS.md       → alternative if you want Mongo instead
SECURITY_CHECKLIST.md        → what's covered, what to double check before launch
```

## What was actually broken in the admin panel, and how it's fixed
The original Figma Make `AdminDashboard` component had one `useState("Dashboard")` that only
changed the page title — clicking "Orders", "Products", "Customers" etc. in the sidebar rendered
the *exact same* hardcoded Dashboard JSX every time, with all numbers as static arrays. Nothing was
broken in the sense of throwing errors — it just never had real "Orders"/"Products" views to switch to.

`AdminDashboard.tsx` in this build replaces that with a real `switch` over `activeItem`, where each
section (`DashboardSection`, `OrdersSection`, `ProductsSection`, `CustomersSection`) fetches live data
from its own `/api/admin/*` route. Add a `ComingSoon` → real section the same way for
Coupons/Reviews/Settings etc. as you need them.

## Get it running
```bash
npm install
cp .env.example .env        # fill in real values — see SETUP_SUPABASE.md
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```
Visit `/login`, sign in with the email/password you set via `SEED_ADMIN_*` env vars, then `/admin`.

## Wiring this to your existing Figma Make UI
Your existing components (ProductCard, CartDrawer, Checkout, etc.) currently read from a static
`PRODUCTS` array in `App.tsx`. Replace those reads with `fetch` calls to the routes above, e.g.:
```ts
// Before (static)
const products = PRODUCTS.filter(p => p.category === selectedCategory);

// After (real backend)
const res = await fetch(`/api/products?category=${selectedCategory}`);
const { items } = await res.json();
```
Do this page by page — Home/Products grid → `/api/products`, Product detail → `/api/products/[slug]`,
Cart → `/api/cart`, Checkout → `/api/checkout` + Razorpay Checkout.js on the frontend, Account → `/api/orders`.

## Deploy (when you're ready)
Recommended: **Vercel** (zero-config Next.js) + **Supabase** (already set up above).
1. Push this repo to GitHub.
2. Vercel → New Project → import repo.
3. Add every variable from `.env.example` into Vercel's Environment Variables.
4. Deploy. Then update the Razorpay webhook URL and `NEXT_PUBLIC_SITE_URL` to your real domain.

Ping me when you're at that step and I'll walk the actual deploy with you.
