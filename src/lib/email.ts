import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");
const FROM = process.env.EMAIL_FROM || "ATLAS <orders@yourdomain.com>";

export async function sendOrderConfirmation(to: string, orderNumber: string, total: number) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Order Confirmed — ${orderNumber}`,
    html: `<div style="font-family:sans-serif">
      <h2>Thanks for your order!</h2>
      <p>Order <strong>${orderNumber}</strong> is confirmed. Total: ₹${(total / 100).toLocaleString("en-IN")}</p>
      <p>We'll email you tracking details once it ships.</p>
    </div>`,
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to ATLAS",
    html: `<div style="font-family:sans-serif"><h2>Welcome, ${name}!</h2><p>Your account is ready.</p></div>`,
  });
}

export async function sendNewsletterWelcome(to: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "You're in the edit",
    html: `<div style="font-family:sans-serif"><p>Thanks for subscribing to ATLAS. New arrivals & editorial picks coming your way.</p></div>`,
  });
}
