import { db } from "@/lib/db";
import HomePageClient from "@/components/HomePageClient";
import { getCurrentUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch active products with images, brand, and category from Postgres
  const dbProducts = await db.product.findMany({
    where: { isActive: true },
    include: {
      images: { orderBy: { position: "asc" } },
      brand: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const categories = await db.category.findMany({});

  // Transform products from DB schema to expected React UI schema
  const products = dbProducts.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand?.name || "ATLAS",
    price: p.price / 100, // DB price is in paise, convert to rupees
    originalPrice: p.originalPrice ? p.originalPrice / 100 : undefined,
    rating: p.rating || 4.7,
    reviews: p.reviewCount || 33,
    image: p.images[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&auto=format",
    badge: p.badge,
    slug: p.slug,
  }));

  const transformedCategories = categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    image: c.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=280&h=360&fit=crop&auto=format",
  }));

  const user = await getCurrentUser();
  const settings = await getSiteSettings();

  // Load published homepage blocks from Postgres
  const cmsPage = await db.cmsPage.findUnique({
    where: { slug: "home" },
  });

  const initialBlocks = cmsPage?.status === "PUBLISHED" && Array.isArray(cmsPage.content)
    ? cmsPage.content
    : [];

  return (
    <HomePageClient
      initialProducts={products as any}
      initialCategories={transformedCategories}
      currentUser={user as any}
      siteSettings={settings as any}
      initialBlocks={initialBlocks as any}
    />
  );
}
