import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { addToCartSchema, updateCartSchema, safeParse } from "@/lib/validations";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await db.cartItem.findMany({
    where: { userId: user.id },
    include: { product: { include: { images: { take: 1, orderBy: { position: "asc" } }, brand: true } } },
    orderBy: { createdAt: "desc" },
  });

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  return NextResponse.json({ items, subtotal, count: items.reduce((s, i) => s + i.qty, 0) });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = safeParse(addToCartSchema, body);
  if (!parsed.ok) return NextResponse.json({ error: "Invalid input", details: parsed.error }, { status: 400 });

  const { productId, variant, qty = 1 } = parsed.data;

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (product.stock < qty) {
    return NextResponse.json({ error: "Not enough stock" }, { status: 409 });
  }

  const item = await db.cartItem.upsert({
    where: { userId_productId_variant: { userId: user.id, productId, variant: variant ?? "" } },
    update: { qty: { increment: qty } },
    create: { userId: user.id, productId, variant: variant ?? "", qty },
    include: { product: true },
  });

  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = safeParse(updateCartSchema, body);
  if (!parsed.ok) return NextResponse.json({ error: "Invalid input", details: parsed.error }, { status: 400 });

  const { itemId, qty } = parsed.data;
  const existing = await db.cartItem.findUnique({ where: { id: itemId } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (qty === 0) {
    await db.cartItem.delete({ where: { id: itemId } });
    return NextResponse.json({ ok: true, removed: true });
  }

  const item = await db.cartItem.update({ where: { id: itemId }, data: { qty } });
  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId } = await req.json().catch(() => ({ itemId: null }));
  if (!itemId) {
    // No itemId → clear whole cart (used after order placement)
    await db.cartItem.deleteMany({ where: { userId: user.id } });
    return NextResponse.json({ ok: true, cleared: true });
  }

  const existing = await db.cartItem.findUnique({ where: { id: itemId } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await db.cartItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
