import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { checkoutSchema, safeParse } from "@/lib/validations";
import { createRazorpayOrder } from "@/lib/razorpay";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

const DELIVERY_FEES: Record<string, number> = { standard: 0, express: 29900, same: 59900 }; // paise

function generateOrderNumber() {
  return `ATL-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString(36).toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = getClientIp(req);
  const { success } = await rateLimit(`${ip}:${user.id}`, "checkout");
  if (!success) return NextResponse.json({ error: "Too many checkout attempts, slow down." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = safeParse(checkoutSchema, body);
  if (!parsed.ok) return NextResponse.json({ error: "Invalid input", details: parsed.error }, { status: 400 });
  const data = parsed.data;

  // Re-fetch cart server-side — never trust client-sent prices/totals.
  const cartItems = await db.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
  });
  if (cartItems.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Verify stock for every line before committing anything.
  for (const item of cartItems) {
    if (item.qty > item.product.stock) {
      return NextResponse.json(
        { error: `${item.product.name} only has ${item.product.stock} left in stock` },
        { status: 409 }
      );
    }
  }

  const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);

  // Coupon validation (server-side, re-checked — never trust a client-sent discount amount)
  let discount = 0;
  if (data.couponCode) {
    const coupon = await db.coupon.findUnique({ where: { code: data.couponCode.toUpperCase() } });
    if (coupon && coupon.isActive && subtotal >= coupon.minOrderValue) {
      const expired = coupon.expiresAt && coupon.expiresAt < new Date();
      const exhausted = coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses;
      if (!expired && !exhausted) {
        discount =
          coupon.discountType === "PERCENT"
            ? Math.round((subtotal * coupon.discountValue) / 100)
            : coupon.discountValue;
      }
    }
  }

  const deliveryMethod = data.deliveryMethod ?? "standard";
  const shippingFee = DELIVERY_FEES[deliveryMethod] ?? 0;
  const total = Math.max(0, subtotal - discount) + shippingFee;
  const orderNumber = generateOrderNumber();

  const order = await db.order.create({
    data: {
      orderNumber,
      userId: user.id,
      subtotal,
      discount,
      shippingFee,
      total,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === "COD" ? "PENDING" : "PENDING",
      status: "PENDING",
      couponCode: data.couponCode,
      shippingName: data.shippingName,
      shippingPhone: data.shippingPhone,
      shippingAddress: data.shippingAddress,
      shippingCity: data.shippingCity,
      shippingState: data.shippingState,
      shippingPin: data.shippingPin,
      deliveryMethod: data.deliveryMethod,
      items: {
        create: cartItems.map((i) => ({
          productId: i.productId,
          name: i.product.name,
          variant: i.variant,
          price: i.product.price,
          qty: i.qty,
        })),
      },
    },
  });

  // COD: confirm immediately, decrement stock, clear cart.
  if (data.paymentMethod === "COD") {
    await db.$transaction([
      ...cartItems.map((i) =>
        db.product.update({ where: { id: i.productId }, data: { stock: { decrement: i.qty } } })
      ),
      db.cartItem.deleteMany({ where: { userId: user.id } }),
      db.order.update({ where: { id: order.id }, data: { status: "CONFIRMED" } }),
    ]);
    if (data.couponCode) {
      await db.coupon.update({ where: { code: data.couponCode.toUpperCase() }, data: { usedCount: { increment: 1 } } }).catch(() => {});
    }
    return NextResponse.json({ order, requiresPayment: false });
  }

  // Online payment: create a Razorpay order, frontend opens Razorpay checkout with this id.
  const rpOrder = await createRazorpayOrder(total, orderNumber);
  await db.order.update({ where: { id: order.id }, data: { razorpayOrderId: rpOrder.id } });

  return NextResponse.json({
    order,
    requiresPayment: true,
    razorpayOrderId: rpOrder.id,
    amount: total,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID,
  });
}
