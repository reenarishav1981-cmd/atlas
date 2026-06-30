# Supabase Setup Guide — ATLAS Commerce OS

Follow in order. Takes ~20 minutes.

## 1. Create the project
1. Go to https://supabase.com → New Project.
2. Pick a strong DB password and **save it somewhere** — you'll need it for `DATABASE_URL`.
3. Choose a region close to your users (e.g. `ap-south-1` Mumbai for India traffic).

## 2. Get your connection strings
Project → **Settings → Database**.
- Copy the **Connection pooling** string (port 6543) → this is `DATABASE_URL`.
- Copy the **Direct connection** string (port 5432) → this is `DIRECT_URL`.
  Prisma needs the direct one for migrations because PgBouncer (pooled) doesn't support
  the prepared statements Prisma's migration engine uses.

Paste both into `.env`:
```
DATABASE_URL="postgresql://postgres.xxxxx:[email protected]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:[email protected]:5432/postgres"
```

## 3. Push the schema
```bash
npm install
npx prisma migrate dev --name init
```
This creates every table in `prisma/schema.prisma` (User, Product, Order, Cart, Review, Coupon, etc.)
directly in your Supabase Postgres instance. Check **Table Editor** in the Supabase dashboard — you should see all tables.

## 4. Seed an admin user + sample data
```bash
SEED_ADMIN_EMAIL="you@yourdomain.com" SEED_ADMIN_PASSWORD="ChooseAStrongOne123" npm run db:seed
```
This creates your first SUPER_ADMIN account so `/admin` actually has someone who can log in.
**Log in once, then change the password** via a future "change password" endpoint — don't ship with the seed password.

## 5. Get your API keys (for Storage / optional Supabase Auth)
Project → **Settings → API**.
- `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose to the browser, never commit it)
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`

## 6. Create a Storage bucket for product images
Dashboard → **Storage** → New bucket → name it `product-images` → set **Public**.
This is what `src/lib/supabase.ts` (`uploadProductImage`) uploads into. Public bucket = anyone can
*view* images by URL (needed for your storefront), but only your service-role key can *upload/delete*.

## 7. (Optional) Row Level Security
Because all reads/writes in this app go through your Next.js API routes (using the service-role-equivalent
Prisma connection), RLS on the Postgres tables themselves is not strictly required — your API layer is
already the security boundary (JWT + role checks in every route). If you later let the frontend talk to
Supabase directly (e.g. via `supabase-js` from the browser) for anything, **turn on RLS on that table first**
and write a policy, otherwise anyone can read/write it with just the anon key. Example for products (read-only public):
```sql
alter table "Product" enable row level security;
create policy "Public read active products"
  on "Product" for select
  using ("isActive" = true);
```

## 8. Secrets checklist before going live
Generate two long random secrets for JWT signing:
```bash
openssl rand -base64 48   # JWT_ACCESS_SECRET
openssl rand -base64 48   # JWT_REFRESH_SECRET — must be different from the above
```
Set these, plus `RAZORPAY_*`, `RESEND_API_KEY`, in your hosting provider's environment variables
(Vercel → Project → Settings → Environment Variables) — never commit `.env` to git.

## 9. Razorpay webhook
Razorpay Dashboard → Settings → Webhooks → Add new webhook:
- URL: `https://yourdomain.com/api/webhooks/razorpay`
- Active events: `payment.captured`, `payment.failed`
- Copy the generated **Webhook Secret** into `RAZORPAY_WEBHOOK_SECRET`.

You're now ready to run `npm run dev`, log in at `/login` with the seeded admin, and confirm `/admin`
shows real KPIs (will be zeros until you place a test order — that's correct, it means it's reading the DB,
not hardcoded numbers anymore).
