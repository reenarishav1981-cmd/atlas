import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterSchema, safeParse } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { sendNewsletterWelcome } from "@/lib/email";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimit(ip, "api");
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = safeParse(newsletterSchema, body);
  if (!parsed.ok) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  await db.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: {},
    create: { email: parsed.data.email },
  });

  sendNewsletterWelcome(parsed.data.email).catch(() => {});
  return NextResponse.json({ ok: true });
}
