const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function main() {
  console.log("Starting database seeding of premium catalog items...");

  // 1. Create or upsert Brands
  const brandsData = [
    { name: "Auros", slug: "auros" },
    { name: "Maison Cleo", slug: "maison-cleo" },
    { name: "Apex Audio", slug: "apex-audio" },
    { name: "Maison Noir", slug: "maison-noir" },
    { name: "Veil", slug: "veil" }
  ];

  const brandMap = {};
  for (const b of brandsData) {
    const brand = await db.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b
    });
    brandMap[b.name] = brand.id;
  }
  console.log("Brands seeded successfully.");

  // 2. Create or upsert Categories
  const categoriesData = [
    { name: "Watches", slug: "watches", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600" },
    { name: "Fashion", slug: "fashion", imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600" },
    { name: "Audio", slug: "audio", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600" },
    { name: "Living", slug: "living", imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600" }
  ];

  const categoryMap = {};
  for (const c of categoriesData) {
    const category = await db.category.upsert({
      where: { slug: c.slug },
      update: { imageUrl: c.imageUrl },
      create: c
    });
    categoryMap[c.name] = category.id;
  }
  console.log("Categories seeded successfully.");

  // 3. Define 10 products per category
  const products = [
    // Category: Watches
    {
      name: "Meridian Chronograph",
      slug: "meridian-chronograph",
      description: "Precision-engineered chronograph featuring an elegant sub-dial layout, premium sapphire glass protection, and durable stainless steel construction built to endure.",
      price: 2499900,
      originalPrice: 3200000,
      sku: "WT-MERID-01",
      stock: 15,
      badge: "Best Seller",
      rating: 4.8,
      reviewCount: 124,
      brandName: "Auros",
      categoryName: "Watches",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
    },
    {
      name: "Stealth Quartz",
      slug: "stealth-quartz",
      description: "Matte black military-grade quartz watch designed for modern adventure. Water resistant up to 100 meters with glow in the dark index hands.",
      price: 1849900,
      originalPrice: 2200000,
      sku: "WT-STEALTH-02",
      stock: 22,
      badge: "Trending",
      rating: 4.6,
      reviewCount: 89,
      brandName: "Auros",
      categoryName: "Watches",
      imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600"
    },
    {
      name: "Legacy Automatic",
      slug: "legacy-automatic",
      description: "Classical mechanical automatic timepiece displaying precision movements. Premium leather straps and mineral glass window casing.",
      price: 4599900,
      originalPrice: 5500000,
      sku: "WT-LEGACY-03",
      stock: 8,
      badge: "Limited Edition",
      rating: 4.9,
      reviewCount: 42,
      brandName: "Auros",
      categoryName: "Watches",
      imageUrl: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600"
    },
    {
      name: "Classic Gold Edition",
      slug: "classic-gold-edition",
      description: "Luxury 18k gold-plated dress watch. Sleek dial markings and an elegant clasp perfect for boardroom meetings or premium events.",
      price: 6499900,
      originalPrice: 7500000,
      sku: "WT-GOLD-04",
      stock: 5,
      badge: "Luxury Choice",
      rating: 4.9,
      reviewCount: 28,
      brandName: "Auros",
      categoryName: "Watches",
      imageUrl: "https://images.unsplash.com/photo-1619134778706-7015533a6150?w=600"
    },
    {
      name: "Aero Chrono Titanium",
      slug: "aero-chrono-titanium",
      description: "Lightweight, robust titanium watch designed for aviation pilots. Detailed tachymeter index mapping and double locked security clasp.",
      price: 3299900,
      sku: "WT-AERO-05",
      stock: 12,
      rating: 4.5,
      reviewCount: 37,
      brandName: "Auros",
      categoryName: "Watches",
      imageUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600"
    },
    {
      name: "Nautilus Sea Diver",
      slug: "nautilus-sea-diver",
      description: "Durable marine divers timepiece featuring automatic mechanical calibration and high visibility luminescent markings.",
      price: 2899900,
      originalPrice: 3590000,
      sku: "WT-NAUT-06",
      stock: 19,
      badge: "Waterproof",
      rating: 4.7,
      reviewCount: 65,
      brandName: "Auros",
      categoryName: "Watches",
      imageUrl: "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=600"
    },
    {
      name: "Voyager Explorer Edition",
      slug: "voyager-explorer-edition",
      description: "Tactical explorer watch engineered to withstand freezing temperatures. Features a shockproof hybrid steel body casing.",
      price: 2149900,
      sku: "WT-VOY-07",
      stock: 14,
      rating: 4.6,
      reviewCount: 54,
      brandName: "Auros",
      categoryName: "Watches",
      imageUrl: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600"
    },
    {
      name: "Vanguard Minimalist Grey",
      slug: "vanguard-minimalist-grey",
      description: "Modern minimalist slate watch with an ultra-thin stainless frame and soft felt grey bands.",
      price: 1549900,
      sku: "WT-VAN-08",
      stock: 30,
      rating: 4.4,
      reviewCount: 71,
      brandName: "Auros",
      categoryName: "Watches",
      imageUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600"
    },
    {
      name: "Nebula Space Watch",
      slug: "nebula-space-watch",
      description: "Avant-garde cosmic watch with a dark galaxy blue starry display index casing and magnetic strap locks.",
      price: 2799900,
      sku: "WT-NEB-09",
      stock: 9,
      badge: "Exclusive",
      rating: 4.8,
      reviewCount: 31,
      brandName: "Auros",
      categoryName: "Watches",
      imageUrl: "https://images.unsplash.com/photo-1495856458515-083d14967ac1?w=600"
    },
    {
      name: "Eclipse Rose Gold",
      slug: "eclipse-rose-gold",
      description: "Luxury ladies dress watch in 18k rose gold plating. Subtle diamond markings and polished clasp layout.",
      price: 3999900,
      originalPrice: 4800000,
      sku: "WT-ECLIPSE-10",
      stock: 7,
      rating: 4.9,
      reviewCount: 46,
      brandName: "Auros",
      categoryName: "Watches",
      imageUrl: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600"
    },

    // Category: Fashion
    {
      name: "Vela Leather Tote Bag",
      slug: "vela-leather-tote-bag",
      description: "Premium hand-stitched full-grain Italian leather tote bag with dedicated internal tech organizer sleeves.",
      price: 849900,
      originalPrice: 1100000,
      sku: "FS-TOTE-01",
      stock: 12,
      badge: "Staff Pick",
      rating: 4.7,
      reviewCount: 94,
      brandName: "Maison Cleo",
      categoryName: "Fashion",
      imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600"
    },
    {
      name: "Studio Leather Jacket",
      slug: "studio-leather-jacket",
      description: "Classic asymmetrical biker jacket constructed with premium supple black lambskin leather and durable zippers.",
      price: 1999900,
      originalPrice: 2490000,
      sku: "FS-JKT-02",
      stock: 5,
      badge: "Iconic",
      rating: 4.8,
      reviewCount: 52,
      brandName: "Maison Noir",
      categoryName: "Fashion",
      imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600"
    },
    {
      name: "Minimalist Wool Overcoat",
      slug: "minimalist-wool-overcoat",
      description: "Double-breasted long winter overcoat crafted from high-density Australian merino wool blends.",
      price: 2499900,
      sku: "FS-WOOL-03",
      stock: 10,
      rating: 4.6,
      reviewCount: 39,
      brandName: "Maison Noir",
      categoryName: "Fashion",
      imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600"
    },
    {
      name: "Artisan Linen Shirt",
      slug: "artisan-linen-shirt",
      description: "Relaxed fit lightweight button-down shirt woven using 100% organic French flax linen yarns.",
      price: 499900,
      sku: "FS-LINEN-04",
      stock: 40,
      rating: 4.5,
      reviewCount: 112,
      brandName: "Maison Cleo",
      categoryName: "Fashion",
      imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600"
    },
    {
      name: "Heritage Denim Jeans",
      slug: "heritage-denim-jeans",
      description: "Classic raw selvedge denim jeans cut in a clean slim straight fit format with heavy brass hardware rivets.",
      price: 799900,
      sku: "FS-DENIM-05",
      stock: 25,
      rating: 4.4,
      reviewCount: 88,
      brandName: "Maison Noir",
      categoryName: "Fashion",
      imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"
    },
    {
      name: "Horizon Leather Boots",
      slug: "horizon-leather-boots",
      description: "Robust Goodyear-welted leather work boots featuring heavy Vibram rubber outsole grips.",
      price: 1399900,
      originalPrice: 1650000,
      sku: "FS-BOOTS-06",
      stock: 14,
      badge: "Trending",
      rating: 4.7,
      reviewCount: 45,
      brandName: "Maison Noir",
      categoryName: "Fashion",
      imageUrl: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600"
    },
    {
      name: "Classic Acetate Sunglasses",
      slug: "classic-acetate-sunglasses",
      description: "Handcrafted cellulose acetate frame sunglasses equipped with polarized 100% UV protection lenses.",
      price: 349900,
      sku: "FS-SUN-07",
      stock: 50,
      rating: 4.6,
      reviewCount: 120,
      brandName: "Veil",
      categoryName: "Fashion",
      imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600"
    },
    {
      name: "Cashmere Knit Sweater",
      slug: "cashmere-knit-sweater",
      description: "Ultra-soft ribbed neck crew sweater knit from premium 2-ply Mongolian cashmere fibers.",
      price: 1699900,
      sku: "FS-SWEATER-08",
      stock: 15,
      rating: 4.9,
      reviewCount: 67,
      brandName: "Maison Cleo",
      categoryName: "Fashion",
      imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600"
    },
    {
      name: "Premium Silk Scarf",
      slug: "premium-silk-scarf",
      description: "Luxury square neck scarf made from pure mulberry silk with dynamic hand-rolled edges.",
      price: 299900,
      sku: "FS-SCARF-09",
      stock: 35,
      rating: 4.8,
      reviewCount: 29,
      brandName: "Maison Cleo",
      categoryName: "Fashion",
      imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600"
    },
    {
      name: "Nomad Leather Backpack",
      slug: "nomad-leather-backpack",
      description: "Full-sized travel backpack engineered using water-resistant oiled canvas and heavy saddle leather straps.",
      price: 1199900,
      sku: "FS-BAG-10",
      stock: 18,
      rating: 4.5,
      reviewCount: 78,
      brandName: "Maison Noir",
      categoryName: "Fashion",
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"
    },

    // Category: Audio
    {
      name: "Studio Headphones MX7",
      slug: "studio-headphones-mx7",
      description: "Professional studio reference headphones offering flat acoustic response tuning and comfortable memory foam cups.",
      price: 1499900,
      originalPrice: 1999900,
      sku: "AU-HEAD-01",
      stock: 25,
      badge: "Audiophile",
      rating: 4.8,
      reviewCount: 164,
      brandName: "Apex Audio",
      categoryName: "Audio",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
    },
    {
      name: "Aurora Earbuds Pro",
      slug: "aurora-earbuds-pro",
      description: "Next-gen true wireless active noise-cancelling earbuds delivering dynamic 3D spatial surround sound.",
      price: 999900,
      originalPrice: 1299900,
      sku: "AU-EARS-02",
      stock: 35,
      badge: "Best Value",
      rating: 4.6,
      reviewCount: 245,
      brandName: "Apex Audio",
      categoryName: "Audio",
      imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600"
    },
    {
      name: "Resonance Soundbar",
      slug: "resonance-soundbar",
      description: "Sleek low-profile home theater soundbar featuring 5 custom drivers and Dolby Atmos calibration support.",
      price: 2799900,
      sku: "AU-BAR-03",
      stock: 10,
      rating: 4.7,
      reviewCount: 81,
      brandName: "Apex Audio",
      categoryName: "Audio",
      imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600"
    },
    {
      name: "Heritage Bookshelf Speakers",
      slug: "heritage-bookshelf-speakers",
      description: "Pair of walnut-cased active bookshelf speakers with integrated Bluetooth and phono pre-amp support.",
      price: 3499900,
      sku: "AU-SPEAK-04",
      stock: 6,
      badge: "Wood Edition",
      rating: 4.9,
      reviewCount: 38,
      brandName: "Apex Audio",
      categoryName: "Audio",
      imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600"
    },
    {
      name: "Zenith ANC Over-Ear",
      slug: "zenith-anc-over-ear",
      description: "Luxury lightweight active noise cancelling wireless headphones with 45-hour battery play time.",
      price: 1899900,
      sku: "AU-HEAD-05",
      stock: 14,
      rating: 4.7,
      reviewCount: 92,
      brandName: "Apex Audio",
      categoryName: "Audio",
      imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600"
    },
    {
      name: "Nomad Wireless Speaker",
      slug: "nomad-wireless-speaker",
      description: "Rugged waterproof outdoor bluetooth speaker constructed with heavy shockproof silicone grids.",
      price: 549900,
      sku: "AU-PORT-06",
      stock: 40,
      rating: 4.4,
      reviewCount: 110,
      brandName: "Apex Audio",
      categoryName: "Audio",
      imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600"
    },
    {
      name: "Echo Studio Monitors",
      slug: "echo-studio-monitors",
      description: "Professional high-fidelity powered studio speakers designed for audio engineers and creators.",
      price: 4299900,
      sku: "AU-SPEAK-07",
      stock: 8,
      rating: 4.9,
      reviewCount: 22,
      brandName: "Apex Audio",
      categoryName: "Audio",
      imageUrl: "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600"
    },
    {
      name: "Wave Sports Buds",
      slug: "wave-sports-buds",
      description: "Sweatproof secure-fit wrap around hooks ear buds perfect for high-intensity training runs.",
      price: 699900,
      sku: "AU-EARS-08",
      stock: 30,
      rating: 4.5,
      reviewCount: 74,
      brandName: "Apex Audio",
      categoryName: "Audio",
      imageUrl: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600"
    },
    {
      name: "Sync Mini Pocket Speaker",
      slug: "sync-mini-pocket-speaker",
      description: "Ultra-compact pocket speaker with high volume audio output and handy loop-hook mount.",
      price: 299900,
      sku: "AU-PORT-09",
      stock: 50,
      rating: 4.3,
      reviewCount: 135,
      brandName: "Apex Audio",
      categoryName: "Audio",
      imageUrl: "https://images.unsplash.com/photo-1589256469067-ea00e21cbdb9?w=600"
    },
    {
      name: "Symphony Hi-Fi Headset",
      slug: "symphony-hi-fi-headset",
      description: "High-resolution custom planar magnetic drivers headset offering ultimate sound stage representation.",
      price: 4999900,
      sku: "AU-HEAD-10",
      stock: 4,
      badge: "Planar Tech",
      rating: 5.0,
      reviewCount: 15,
      brandName: "Apex Audio",
      categoryName: "Audio",
      imageUrl: "https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=600"
    },

    // Category: Living
    {
      name: "Walnut Sideboard Cabinet",
      slug: "walnut-sideboard-cabinet",
      description: "Artisanal media console sideboard featuring solid American walnut frames and smooth soft-close cabinet doors.",
      price: 8999900,
      originalPrice: 11000000,
      sku: "LV-CAB-01",
      stock: 4,
      badge: "Artisan Wood",
      rating: 4.9,
      reviewCount: 31,
      brandName: "Auros",
      categoryName: "Living",
      imageUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600"
    },
    {
      name: "Nordic Lounge Chair",
      slug: "nordic-lounge-chair",
      description: "Ergonomic lounge chair styled with bent oak wood frames and soft linen upholstery cushions.",
      price: 4299900,
      originalPrice: 4999900,
      sku: "LV-CHAIR-02",
      stock: 8,
      badge: "Top Seller",
      rating: 4.8,
      reviewCount: 76,
      brandName: "Auros",
      categoryName: "Living",
      imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600"
    },
    {
      name: "Ceramic Coffee Dripper Set",
      slug: "ceramic-coffee-dripper-set",
      description: "Minimalist raw clay ceramic coffee dripper and matching glass server pitcher kettle set.",
      price: 349900,
      sku: "LV-CER-03",
      stock: 40,
      rating: 4.7,
      reviewCount: 145,
      brandName: "Maison Cleo",
      categoryName: "Living",
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600"
    },
    {
      name: "Brass Studio Desk Lamp",
      slug: "brass-studio-desk-lamp",
      description: "Adjustable desk lamp crafted with solid antique brass rods and heavy marble base mounts.",
      price: 649900,
      sku: "LV-LAMP-04",
      stock: 20,
      rating: 4.6,
      reviewCount: 55,
      brandName: "Auros",
      categoryName: "Living",
      imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600"
    },
    {
      name: "Hand-Woven Wool Rug",
      slug: "hand-woven-wool-rug",
      description: "Textured geometric pattern living room rug hand-knotted by artisans using pure natural wool yarns.",
      price: 2899900,
      sku: "LV-RUG-05",
      stock: 12,
      rating: 4.8,
      reviewCount: 27,
      brandName: "Maison Noir",
      categoryName: "Living",
      imageUrl: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600"
    },
    {
      name: "Organic Linen Duvet Set",
      slug: "organic-linen-duvet-set",
      description: "Premium breathable double linen bedding duvet set woven from pure organic French flax fiber.",
      price: 1249900,
      sku: "LV-BED-06",
      stock: 18,
      rating: 4.7,
      reviewCount: 83,
      brandName: "Maison Cleo",
      categoryName: "Living",
      imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600"
    },
    {
      name: "Oak Dining Table",
      slug: "oak-dining-table",
      description: "Spacious solid white oak dining table constructed with raw timber grains and clean mortise joins.",
      price: 9599900,
      sku: "LV-TABLE-07",
      stock: 3,
      rating: 4.9,
      reviewCount: 18,
      brandName: "Auros",
      categoryName: "Living",
      imageUrl: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=600"
    },
    {
      name: "Velvet Lounge Armchair",
      slug: "velvet-lounge-armchair",
      description: "Mid-century styled velvet upholstered armchair in dark olive color featuring gold finished metal legs.",
      price: 3899900,
      sku: "LV-CHAIR-08",
      stock: 7,
      rating: 4.6,
      reviewCount: 42,
      brandName: "Auros",
      categoryName: "Living",
      imageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600"
    },
    {
      name: "Minimalist Wooden Wall Clock",
      slug: "minimalist-wooden-wall-clock",
      description: "Silent quartz movement wall clock made using single slab solid maple wood face designs.",
      price: 449900,
      sku: "LV-CLOCK-09",
      stock: 25,
      rating: 4.5,
      reviewCount: 93,
      brandName: "Auros",
      categoryName: "Living",
      imageUrl: "https://images.unsplash.com/photo-1563861826100-9cb868fdcd1c?w=600"
    },
    {
      name: "Terrazzo Speckled Vase",
      slug: "terrazzo-speckled-vase",
      description: "Hand-cast terrazzo speckled concrete vase ideal for dry floral botanical stems.",
      price: 249900,
      sku: "LV-VASE-10",
      stock: 30,
      rating: 4.4,
      reviewCount: 66,
      brandName: "Maison Cleo",
      categoryName: "Living",
      imageUrl: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600"
    }
  ];

  // 4. Upsert Products and associate images
  for (const p of products) {
    const categoryId = categoryMap[p.categoryName];
    const brandId = brandMap[p.brandName];

    if (!categoryId || !brandId) {
      console.warn(`Skipping ${p.name} - category/brand missing.`);
      continue;
    }

    const { categoryName, brandName, imageUrl, ...payload } = p;
    const dbProduct = await db.product.upsert({
      where: { slug: p.slug },
      update: {
        price: payload.price,
        originalPrice: payload.originalPrice,
        stock: payload.stock,
        badge: payload.badge,
        rating: payload.rating,
        reviewCount: payload.reviewCount,
        categoryId,
        brandId
      },
      create: {
        ...payload,
        categoryId,
        brandId
      }
    });

    // Seed main image
    await db.productImage.deleteMany({ where: { productId: dbProduct.id } });
    await db.productImage.create({
      data: {
        productId: dbProduct.id,
        url: imageUrl,
        altText: p.name,
        position: 0
      }
    });
  }

  console.log("Database catalog seeding finished successfully! Total 40 products inserted/updated.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
