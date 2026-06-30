import { db } from "@/lib/db";
import CategoryPageClient from "@/components/CategoryPageClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function ProductsCatalogPage() {
  const dbProducts = await db.product.findMany({
    where: { isActive: true },
    include: {
      images: { orderBy: { position: "asc" } },
      brand: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const products = dbProducts.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand?.name || "ATLAS",
    category: p.category?.name || "Uncategorized",
    price: p.price / 100, // convert paise to rupees
    originalPrice: p.originalPrice ? p.originalPrice / 100 : undefined,
    rating: p.rating || 4.7,
    reviews: p.reviewCount || 33,
    image: p.images[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&auto=format",
    badge: p.badge,
    slug: p.slug,
    stock: p.stock,
  }));

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] text-sm text-[#9E9B97]">Loading products...</div>}>
      <CategoryPageClient initialProducts={products as any} />
    </Suspense>
  );
}
