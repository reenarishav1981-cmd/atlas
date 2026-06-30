import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@atlas.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Arjun Kapoor",
      email: adminEmail,
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log(`✓ Admin user ready → ${admin.email} / ${adminPassword} (CHANGE THIS PASSWORD AFTER FIRST LOGIN)`);

  const electronics = await db.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: { name: "Electronics", slug: "electronics" },
  });

  const auros = await db.brand.upsert({
    where: { slug: "auros" },
    update: {},
    create: { name: "Auros", slug: "auros" },
  });

  await db.product.upsert({
    where: { slug: "meridian-chronograph" },
    update: {},
    create: {
      name: "Meridian Chronograph",
      slug: "meridian-chronograph",
      description: "A precision chronograph watch with sapphire crystal and stainless steel case.",
      price: 2499900, // ₹24,999 in paise
      originalPrice: 3200000,
      sku: "AUR-MER-001",
      stock: 24,
      badge: "Best Seller",
      categoryId: electronics.id,
      brandId: auros.id,
      metaTitle: "Meridian Chronograph by Auros | ATLAS",
      metaDescription: "Shop the Meridian Chronograph — precision engineering, sapphire crystal, stainless steel.",
      images: {
        create: [{ url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop&auto=format", position: 0 }],
      },
    },
  });

  await db.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", discountType: "PERCENT", discountValue: 10, minOrderValue: 100000, isActive: true },
  });

  // Seed Default Roles
  await db.userRole.upsert({
    where: { name: "Customer Support" },
    update: {},
    create: {
      name: "Customer Support",
      permissions: ["orders:read", "orders:write", "crm:read"],
    },
  });

  await db.userRole.upsert({
    where: { name: "Content Editor" },
    update: {},
    create: {
      name: "Content Editor",
      permissions: ["catalog:*", "cms:*"],
    },
  });

  await db.userRole.upsert({
    where: { name: "Marketing Manager" },
    update: {},
    create: {
      name: "Marketing Manager",
      permissions: ["catalog:read", "crm:read", "marketing:*"],
    },
  });

  // Seed Default Feature Flags
  await db.featureFlag.upsert({
    where: { key: "loyalty-rewards" },
    update: {},
    create: { key: "loyalty-rewards", description: "Enables customer reward points wallet", isEnabled: true },
  });

  await db.featureFlag.upsert({
    where: { key: "advanced-cms" },
    update: {},
    create: { key: "advanced-cms", description: "Enables modular layout page builder", isEnabled: false },
  });

  console.log("✓ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
