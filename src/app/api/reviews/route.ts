import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { reviewSchema, safeParse } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = safeParse(reviewSchema, body);
  if (!parsed.ok) return NextResponse.json({ error: "Invalid input", details: parsed.error }, { status: 400 });
  const { productId, rating, text } = parsed.data;

  // Mark verified if this user has a delivered order containing the product.
  const verifiedPurchase = await db.orderItem.findFirst({
    where: { productId, order: { userId: user.id, status: "DELIVERED" } },
  });

  const review = await db.review.create({
    data: { productId, userId: user.id, rating, text, isVerified: !!verifiedPurchase },
  });

  // Recalculate aggregate rating/count on the product.
  const agg = await db.review.aggregate({ where: { productId }, _avg: { rating: true }, _count: true });
  await db.product.update({
    where: { id: productId },
    data: { rating: agg._avg.rating ?? 0, reviewCount: agg._count },
  });

  return NextResponse.json({ review }, { status: 201 });
}
