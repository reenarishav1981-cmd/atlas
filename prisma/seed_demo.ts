import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const BRANDS = ["Auros", "Maison Cleo", "Apex", "Maison Noir", "Veil Eyewear", "Auris"];
const CATEGORIES = ["Electronics", "Fashion", "Furniture", "Beauty", "Jewelry", "Sports"];

const PRODUCT_IMAGES: Record<string, string[]> = {
  Electronics: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=60",
  ],
  Fashion: [
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&auto=format&fit=crop&q=60",
  ],
  Furniture: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=60",
  ],
  Beauty: [
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&auto=format&fit=crop&q=60",
  ],
  Jewelry: [
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=60",
  ],
  Sports: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&auto=format&fit=crop&q=60",
  ],
};

async function main() {
  console.log("Seeding 100 products...");

  // 1. Create brands
  const brandMap: Record<string, string> = {};
  for (const b of BRANDS) {
    const brand = await db.brand.upsert({
      where: { slug: b.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: { name: b, slug: b.toLowerCase().replace(/\s+/g, "-") },
    });
    brandMap[b] = brand.id;
  }

  // 2. Create categories
  const catMap: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const cat = await db.category.upsert({
      where: { slug: c.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: { name: c, slug: c.toLowerCase().replace(/\s+/g, "-") },
    });
    catMap[c] = cat.id;
  }

  // 3. Generate 100 products
  const badges = ["Best Seller", "New", "Sale", null, "Limited Edition", "Trending"];
  const adjectives = ["Premium", "Classic", "Vogue", "Signature", "Heritage", "Ultra", "Minimalist", "Deluxe", "Imperial"];
  const productTypes: Record<string, string[]> = {
    Electronics: ["Chronograph Smartwatch", "Active ANC Headphones", "Minimalist Speaker Desk", "Sleek Phone Dock", "USB-C Travel Adapter"],
    Fashion: ["Signature Carry Tote", "Classic Canvas Weekender", "Vogue Frame Glasses", "Minimalist Knit Sweater", "Deluxe Slim Wallet"],
    Furniture: ["Heritage Lounge Armchair", "Minimalist Study Table", "Deluxe Velvet Chair", "Vogue Ceramic Vase"],
    Beauty: ["Imperial Eau de Parfum", "Pure Botanic Body Oil", "Signature Facial Cream", "Nourishing Night Balm"],
    Jewelry: ["Signature Gold Link Bracelet", "Minimalist Silver Pendant", "Vogue Diamond Studs"],
    Sports: ["Performance Running Sneakers", "Imperial Gym Duffle", "Performance Tennis Grip"],
  };

  let count = 0;
  for (let i = 1; i <= 100; i++) {
    const category = CATEGORIES[i % CATEGORIES.length];
    const brand = BRANDS[i % BRANDS.length];
    
    const catId = catMap[category];
    const brandId = brandMap[brand];

    const adj = adjectives[i % adjectives.length];
    const types = productTypes[category];
    const type = types[i % types.length];
    
    const name = `${brand} ${adj} ${type} ${Math.floor(i / 10) ? RomanNumeral(Math.floor(i / 10)) : ""}`.trim();
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${i}`;
    const sku = `${brand.slice(0, 3).toUpperCase()}-${category.slice(0, 3).toUpperCase()}-${i.toString().padStart(3, "0")}`;
    
    const priceRupees = Math.round(999 + (i * 470));
    const price = priceRupees * 100;
    const originalPrice = i % 3 === 0 ? Math.round(priceRupees * 1.25) * 100 : undefined;
    
    const stock = i % 7 === 0 ? 0 : Math.round(5 + (i * 0.8));
    const rating = Math.round((4.0 + (i % 10) * 0.1) * 10) / 10;
    const reviewCount = Math.round(12 + (i * 3.5));
    const badge = badges[i % badges.length];

    const description = `This is the premium ${name}. Made with exceptional craftsmanship and high-grade materials, it embodies the classic ATLAS standard of luxury. Suitable for collectors and enthusiasts looking for high quality.`;
    
    const imgs = PRODUCT_IMAGES[category];
    const mainImgUrl = imgs[i % imgs.length];

    await db.product.create({
      data: {
        name,
        slug,
        sku,
        description,
        price,
        originalPrice,
        stock,
        rating,
        reviewCount,
        badge,
        categoryId: catId,
        brandId: brandId,
        isActive: true,
        images: {
          create: [
            { url: mainImgUrl, position: 0 },
            { url: imgs[(i + 1) % imgs.length], position: 1 }
          ]
        }
      }
    });
    count++;
  }

  console.log(`Successfully seeded ${count} products!`);
}

function RomanNumeral(num: number): string {
  const roman: Record<string, number> = { X: 10, IX: 9, V: 5, IV: 4, I: 1 };
  let str = "";
  for (const i of Object.keys(roman)) {
    const q = Math.floor(num / roman[i]);
    num -= q * roman[i];
    str += i.repeat(q);
  }
  return str;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
