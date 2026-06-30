# ADMIN_UPGRADE_NOTES.md — Kya Add Hua Hai, Exactly

Tumne pucha tha "admin sb khud se kar paye" — yahan exact list hai kya naya banaya gaya hai.
Koi purana feature nahi hataya gaya, sirf naya add hua hai.

## 1. Hero Banner + Announcement Bar — ab 100% admin-editable
**Naya:** `/admin` → **Settings** tab.
- Announcement bar: text change karo, ya pura on/off kar do.
- Hero banner: heading (2 lines), subtitle paragraph, badge text, dono button ka text — sab
  text fields se edit hota hai.
- **Hero image** — file upload box hai, seedha apne computer se image upload karo, URL
  paste karne ki zaroorat nahi.
- "Save Changes" dabao → homepage pe turant live (refresh karke dekho).

**Kaise kaam karta hai (technical):** Ek `SiteSettings` table DB mein bani hai (sirf ek row,
hamesha rehti hai). Homepage (`src/app/page.tsx`) ab is table se text/image read karta hai
instead of hardcoded strings. Agar admin ne kabhi Settings na bhi khola ho, default values
already set hain — site kabhi blank nahi dikhega.

## 2. Product Add/Edit — ab full-featured hai
**Pehle:** Sirf naam/price/stock/1 image-URL field tha. Edit/Delete bhi nahi tha.

**Ab:**
- **Real image upload** — file picker se multiple photos upload karo, URL nahi chahiye.
- **Category & Brand** — dropdown se select karo, ya seedha "+ New category/brand name" type
  karke turant naya bana lo, bina kahin aur jaake.
- **Specifications** — "+ Add spec" button se jitne chaho key-value rows add karo
  (e.g. Material → Stainless Steel, Warranty → 2 Years). Ye product page pe customer ko
  ek clean table mein dikhta hai.
- **Edit button** — har product row pe, click karke wahi form khulta hai pre-filled, save
  karo to update ho jata hai.
- **Remove button** — product hata sakte ho (soft-delete — purane orders ka history nahi
  tootega).

## 3. Naye backend routes (in case kabhi dev se baat karni pade)
- `GET/PATCH /api/admin/settings` — hero/announcement read-write
- `POST /api/admin/upload` — image upload (Supabase Storage mein jata hai)
- `GET/POST /api/admin/categories` — category list + create
- `GET/POST /api/admin/brands` — brand list + create
- `PATCH /api/products/[slug]` — ab images aur specs bhi properly save karta hai (pehle
  images field silently ignore ho rahi thi edit ke time — wo bug bhi fix ho gaya)

## 4. Security fix jo Antigravity ke patch se chhoot gaya tha
Password minimum length 4 character tha (bahut weak, koi bhi guess kar lega). Wapas 6
character kar diya — strict complexity rules (uppercase/number mandatory) nahi rakhe taaki
signup mein "Invalid input" wapas na aaye, but ek balance maintain kiya hai.

## 5. Setup step jo missing hai abhi
Image upload chalne ke liye Supabase mein ek Storage bucket chahiye:
1. Supabase dashboard → **Storage** → **New bucket**
2. Name: `product-images`
3. **Public bucket** ON karo (taaki uploaded images website pe dikhein)

Bina is step ke, "+ Upload" button error dega. Ye one-time setup hai, 1 min ka kaam.

## Next mile-stones (jab chaho bolna)
- Coupons section ko bhi real banana (abhi placeholder hai)
- Wishlist ko admin se dikhna (kitne logon ne kya wishlist kiya)
- Order status change pe customer ko email jaye (Resend already wired hai, sirf trigger
  add karna hai)
