import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { getSiteSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

const updateSchema = z.object({
  siteName: z.string().trim().min(1).max(60).optional(),
  announcementEnabled: z.boolean().optional(),
  announcementText: z.string().trim().max(200).optional(),
  heroBadgeText: z.string().trim().max(60).optional(),
  heroHeadingLine1: z.string().trim().max(60).optional(),
  heroHeadingLine2: z.string().trim().max(60).optional(),
  heroSubtitle: z.string().trim().max(300).optional(),
  heroImageUrl: z.string().trim().url().optional(),
  heroCtaPrimaryText: z.string().trim().max(40).optional(),
  heroCtaSecondaryText: z.string().trim().max(40).optional(),
  footerText: z.string().trim().max(200).optional(),
});

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const settings = await db.siteSettings.upsert({
    where: { id: "main" },
    update: parsed.data,
    create: { id: "main", ...parsed.data },
  });

  return NextResponse.json({ settings });
}
