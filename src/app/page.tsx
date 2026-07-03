import type { Metadata } from "next";
import { db } from "@/lib/db";
import HomePageClient from "@/components/HomePageClient";
import { getCurrentUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";

export const revalidate = 15;

export const metadata: Metadata = {
  title: "ATLAS | Premium Commerce OS — Curated Luxury & Lifestyle",
  description: "Discover ATLAS Commerce, the ultimate destination for curated premium luxury products, home decor, fashion, and lifestyle items. Lightning-fast secure checkout.",
  alternates: {
    canonical: "https://atlas-gray-alpha.vercel.app/",
  },
  openGraph: {
    title: "ATLAS | Premium Commerce OS",
    description: "Curated premium luxury products, home decor, fashion, and lifestyle items.",
    url: "https://atlas-gray-alpha.vercel.app/",
    siteName: "ATLAS",
    images: [
      {
        url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200",
        width: 1200,
        height: 630,
        alt: "ATLAS Luxury Storefront",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default async function HomePage() {
  // Fetch site data in parallel to avoid database query cascading and latency waterfall
  const [dbProducts, categories, settings, cmsPage] = await Promise.all([
    db.product.findMany({
      where: { isActive: true },
      include: {
        images: { orderBy: { position: "asc" } },
        brand: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({}),
    getSiteSettings(),
    db.cmsPage.findUnique({
      where: { slug: "home" },
    }),
  ]);

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

  const initialBlocks = cmsPage?.status === "PUBLISHED" && Array.isArray(cmsPage.content)
    ? cmsPage.content
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "name": "ATLAS",
    "url": "https://atlas-gray-alpha.vercel.app/",
    "logo": "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200",
    "description": "Curated premium luxury products, home decor, fashion, and lifestyle items. Lightning-fast secure checkout.",
    "telephone": "+919999999999",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Mumbai",
      "addressCountry": "IN"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePageClient
        initialProducts={products as any}
        initialCategories={transformedCategories}
        currentUser={null}
        siteSettings={settings as any}
        initialBlocks={initialBlocks as any}
      />
    </>
  );
}
