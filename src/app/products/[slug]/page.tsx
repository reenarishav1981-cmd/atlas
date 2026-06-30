import type { Metadata } from "next";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailsClient from "@/components/ProductDetailsClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug }, include: { images: { take: 1 } } });
  if (!product) return {};

  const title = product.metaTitle || `${product.name} | ATLAS`;
  const description = product.metaDescription || product.description.slice(0, 160);
  const image = product.images[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title,
      description,
      images: image ? [{ url: image, width: 800, height: 800 }] : [],
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] },
  };
}

export async function generateStaticParams() {
  try {
    if (!process.env.DATABASE_URL) return [];
    const products = await db.product.findMany({ where: { isActive: true }, select: { slug: true }, take: 50 });
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export const revalidate = 3600; // re-generate this page at most once per hour

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { position: "asc" } }, brand: true },
  });

  if (!product || !product.isActive) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((i) => i.url),
    description: product.description,
    sku: product.sku,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: (product.price / 100).toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      product.rating > 0
        ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount || 10 }
        : undefined,
  };

  return (
    <>
      {/* Structured data — drives Google rich results (price, stock, star rating) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetailsClient product={product as any} />
    </>
  );
}
