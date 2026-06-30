import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { couponValidateSchema, safeParse } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = safeParse(couponValidateSchema, body);
  if (!parsed.ok) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { code, subtotal } = parsed.data;
  const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });

  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ valid: false, reason: "Invalid coupon code" }, { status: 200 });
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, reason: "Coupon expired" }, { status: 200 });
  }
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ valid: false, reason: "Coupon usage limit reached" }, { status: 200 });
  }
  if (subtotal < coupon.minOrderValue) {
    return NextResponse.json(
      { valid: false, reason: `Minimum order value ₹${coupon.minOrderValue / 100} required` },
      { status: 200 }
    );
  }

  const discount =
    coupon.discountType === "PERCENT" ? Math.round((subtotal * coupon.discountValue) / 100) : coupon.discountValue;

  return NextResponse.json({ valid: true, discount, code: coupon.code });
}
