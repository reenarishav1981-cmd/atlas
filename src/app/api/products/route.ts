import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { productCreateSchema, safeParse } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// GET /api/products?category=&brand=&q=&sort=&page=&limit=&inStock=&minPrice=&maxPrice=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(48, Math.max(1, Number(searchParams.get("limit") ?? 12)));
  const category = searchParams.get("category") || undefined;
  const brand = searchParams.get("brand") || undefined;
  const q = searchParams.get("q") || undefined;
  const inStock = searchParams.get("inStock") === "true";
  const minPrice = Number(searchParams.get("minPrice") ?? 0);
  const maxPrice = Number(searchParams.get("maxPrice") ?? 10_000_000);
  const sort = searchParams.get("sort") || "featured";

  const where: any = {
    isActive: true,
    price: { gte: minPrice, lte: maxPrice },
    ...(category ? { category: { slug: category } } : {}),
    ...(brand ? { brand: { slug: brand } } : {}),
    ...(inStock ? { stock: { gt: 0 } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
      ? { price: "desc" as const }
      : sort === "newest"
      ? { createdAt: "desc" as const }
      : sort === "rating"
      ? { rating: "desc" as const }
      : { createdAt: "desc" as const }; // "featured" fallback

  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { images: { orderBy: { position: "asc" }, take: 1 }, brand: true, category: true },
    }),
    db.product.count({ where }),
  ]);

  return NextResponse.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

// POST /api/products — admin only, creates a new product
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimit(ip, "api");
  if (!success) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const user = await getCurrentUser();
  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = safeParse(productCreateSchema, body);
  if (!parsed.ok) return NextResponse.json({ error: "Invalid input", details: parsed.error }, { status: 400 });

  const { images = [], ...data } = parsed.data;
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const existingSlug = await db.product.findUnique({ where: { slug } });
  if (existingSlug) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });

  const product = await db.product.create({
    data: {
      ...data,
      slug,
      images: { create: images.map((url, i) => ({ url, position: i })) },
    },
    include: { images: true },
  });

  return NextResponse.json({ product }, { status: 201 });
}
