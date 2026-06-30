# MongoDB Atlas Alternative

The schema above (`prisma/schema.prisma`) is written for Postgres because relational data
(orders ↔ order items ↔ products, foreign keys, transactions for stock decrement) maps cleanly
to it and Prisma's transactions are stronger on Postgres. **Supabase is the recommended path.**

If you'd still rather use MongoDB Atlas (e.g. because Creatokite/other projects already use it
and you want one DB to manage), here's what changes:

## 1. Create the cluster
1. https://cloud.mongodb.com → New Project → Build a Database → Free/M10 tier.
2. Database Access → add a user with a strong password.
3. Network Access → add your IP (or `0.0.0.0/0` for Vercel, since it has no fixed IP — lock this
   down with Atlas's "Vercel integration" for proper IP allowlisting later).
4. Get the connection string from **Connect → Drivers**.

## 2. Switch Prisma's provider
In `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```
Remove `directUrl` (Mongo doesn't need it).

## 3. Schema changes required for Mongo
Mongo's Prisma connector has real differences from Postgres:
- Every model's `id` must be `@id @default(auto()) @map("_id") @db.ObjectId`
- Relation fields that reference another model's id need `@db.ObjectId` too
  (e.g. `userId String @db.ObjectId`)
- **No native transactions across unrelated writes the same way** — Mongo supports multi-document
  transactions only within a replica set (Atlas gives you this by default), but Prisma's `$transaction`
  works differently: it's an array of independent operations, not a SQL-style atomic block. For the
  stock-decrement-on-payment logic in `webhooks/razorpay/route.ts`, this still works correctly with
  `db.$transaction([...])`, but test it — if you need stricter atomicity, wrap writes with Mongo's
  session API directly via `$runCommandRaw` instead of relying on Prisma's abstraction.
- `enum` works the same. `@unique` composite keys work the same.

## 4. Connection string format
```
DATABASE_URL="mongodb+srv://user:[email protected]/atlas-commerce?retryWrites=true&w=majority"
```

## 5. Run
```bash
npx prisma generate
npx prisma db push   # Mongo has no migrations, db push syncs the schema directly
npm run db:seed
```

## Recommendation
Stick with **Supabase/Postgres** for this project — you already have strict relational
integrity needs (an Order must reference real OrderItems referencing real Products with
accurate stock counts), and Postgres + Prisma transactions handle that more safely than
Mongo's document model. Use Mongo Atlas if you specifically want everything (Creatokite +
this) on one Atlas cluster for convenience — it's supported, just keep the caveats above in mind.
