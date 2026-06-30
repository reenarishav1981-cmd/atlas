import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { productUpdateSchema, safeParse } from "@/lib/validations";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      brand: true,
      category: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const body = await req.json().catch(() => null);
  const parsed = safeParse(productUpdateSchema, body);
  if (!parsed.ok) return NextResponse.json({ error: "Invalid input", details: parsed.error }, { status: 400 });

  const { images, ...data } = parsed.data;
  const product = await db.product.update({
    where: { slug },
    data: {
      ...data,
      ...(images
        ? {
            images: {
              deleteMany: {}, // replace the full image set with the new one from the edit form
              create: images.map((url, i) => ({ url, position: i })),
            },
          }
        : {}),
    },
    include: { images: true },
  });
  return NextResponse.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  // Soft delete — keeps order history intact instead of hard-deleting referenced rows.
  await db.product.update({ where: { slug }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
