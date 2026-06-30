import Razorpay from "razorpay";
import crypto from "crypto";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
});

/** Creates a Razorpay order. Amount must be in paise (smallest currency unit). */
export async function createRazorpayOrder(amountInPaise: number, receipt: string) {
  return razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt,
    payment_capture: true,
  });
}

/** Verifies the HMAC signature Razorpay sends back after checkout completes. */
export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  // timing-safe comparison
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/** Verifies the webhook signature Razorpay sends in the `x-razorpay-signature` header. */
export function verifyRazorpayWebhookSignature(rawBody: string, signature: string) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
