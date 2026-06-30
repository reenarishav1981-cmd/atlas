import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const bodySchema = z.object({ productId: z.string().cuid() });

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await db.wishlistItem.findMany({
    where: { userId: user.id },
    include: { product: { include: { images: { take: 1, orderBy: { position: "asc" } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const item = await db.wishlistItem.upsert({
    where: { userId_productId: { userId: user.id, productId: parsed.data.productId } },
    update: {},
    create: { userId: user.id, productId: parsed.data.productId },
  });
  return NextResponse.json({ item }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await db.wishlistItem
    .delete({ where: { userId_productId: { userId: user.id, productId: parsed.data.productId } } })
    .catch(() => {});
  return NextResponse.json({ ok: true });
}
