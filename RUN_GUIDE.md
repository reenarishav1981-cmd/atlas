# ATLAS Commerce OS — RUN GUIDE (Hinglish)

Iss guide ko follow karke aap easily pure project (frontend + backend) ko database se connect karke test kar sakte hain.

---

### Step 1: Install Dependencies
Sabse pehle project ki libraries install karein. (Aapke liye humne `npm install` background mein execute kar diya hai).
```bash
npm install
```
* **Checkpoint:** `node_modules` folder create ho jana chahiye.

---

### Step 2: Supabase setup aur Environment Variables (`.env`)
Project root folder mein `.env.example` file ko duplicate karke ek nayi file banayein jiska naam **`.env`** rakhein.

Supabase par account banayein aur ek naya database create karein. Phir `.env` file mein niche diye gaye details fill karein:
* `DATABASE_URL`: Transaction connection string.
* `DIRECT_URL`: Direct session connection string.
* `JWT_ACCESS_SECRET` aur `JWT_REFRESH_SECRET`: Random complex string (jaise `supersecret123...`).

* **Checkpoint:** `.env` file root directory mein exist karni chahiye aur credentials filled hone chahiye.

---

### Step 3: Run Database Migration
Database tables aur schema create karne ke liye migrations run karein:
```bash
npx prisma migrate dev --name init
```
* **Checkpoint:** Supabase database check karein, wahan `User`, `Product`, `Order`, `CartItem`, etc. tables dikhni chahiye.

---

### Step 4: Seed Database (Admin + Sample Data)
Prisma seed script run karke first Admin account, sample product categories aur products ko DB mein insert karein:
```bash
npm run db:seed
```
* **Checkpoint:** Terminal par message show hoga: `✓ Admin user ready → admin@atlas.com / Admin@12345` aur `✓ Seed complete.`

---

### Step 5: Start Dev Server
Dev server start karein:
```bash
npm run dev
```
* **Checkpoint:** Terminal par message aayega: `Ready in ...` aur link show hoga `http://localhost:3000`.

---

### Step 6: Test User Registration aur Auth
1. Browser mein `http://localhost:3000/register` par jayein aur naya customer account banayein.
2. Banane ke baad use `/login` se sign in karein.
* **Checkpoint:** Login karne ke baad aap apne `/account` dashboard ya home page par automatically redirect ho jayenge.

---

### Step 7: Test Homepage + Cart Flow
1. Home page (`http://localhost:3000`) par jayein. Wahan seed kiya hua **"Meridian Chronograph"** product show hoga.
2. Uske niche **"Quick Add"** click karein.
3. Navbar mein Cart icon par count update ho jayega.
4. Cart page (`http://localhost:3000/cart`) par ja kar quantity change ya remove test karein.
5. **"Proceed to Checkout"** click karein, shipping address dalein, payment method mein **"COD"** select karke order confirm karein.
* **Checkpoint:** Browser window par **"Order Confirmed!"** aur order number show ho jayega.

---

### Step 8: Test Admin Console
1. `/login` par ja kar admin email aur password se sign in karein:
   * **Email:** `admin@atlas.com`
   * **Password:** `Admin@12345`
2. Phir browser mein `http://localhost:3000/admin` par jayein.
* **Checkpoint:** Admin Dashboard console open hoga, wahan customer statistics, live order reports aur product database lists live database se load honge!
