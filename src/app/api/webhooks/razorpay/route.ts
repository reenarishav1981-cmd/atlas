import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { sendOrderConfirmation } from "@/lib/email";

/**
 * Razorpay webhooks are the source of truth for payment status — never rely solely
 * on the client-side callback after checkout, since that can be spoofed or dropped.
 * Configure this URL in the Razorpay dashboard: Settings → Webhooks.
 * Events to subscribe: payment.captured, payment.failed
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature || !verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const paymentEntity = event.payload?.payment?.entity;
  if (!paymentEntity) return NextResponse.json({ ok: true });

  const razorpayOrderId = paymentEntity.order_id;
  const order = await db.order.findFirst({
    where: { razorpayOrderId },
    include: { items: true, user: true },
  });
  if (!order) return NextResponse.json({ ok: true }); // unknown order, ack anyway

  if (event.event === "payment.captured") {
    if (order.paymentStatus === "PAID") return NextResponse.json({ ok: true }); // idempotency guard

    await db.$transaction([
      db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          razorpayPaymentId: paymentEntity.id,
        },
      }),
      ...order.items.map((i) =>
        db.product.update({ where: { id: i.productId }, data: { stock: { decrement: i.qty } } })
      ),
      db.cartItem.deleteMany({ where: { userId: order.userId } }),
    ]);

    if (order.couponCode) {
      await db.coupon
        .update({ where: { code: order.couponCode.toUpperCase() }, data: { usedCount: { increment: 1 } } })
        .catch(() => {});
    }

    sendOrderConfirmation(order.user.email, order.orderNumber, order.total).catch(() => {});
  }

  if (event.event === "payment.failed") {
    await db.order.update({
      where: { id: order.id },
      data: { paymentStatus: "FAILED", status: "CANCELLED" },
    });
  }

  return NextResponse.json({ ok: true });
}
