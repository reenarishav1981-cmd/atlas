import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ categories });
}

const schema = z.object({
  name: z.string().trim().min(2).max(60),
  imageUrl: z.string().trim().url().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const slug = slugify(parsed.data.name);
  const category = await db.category.upsert({
    where: { slug },
    update: {},
    create: { name: parsed.data.name, slug, imageUrl: parsed.data.imageUrl },
  });

  return NextResponse.json({ category }, { status: 201 });
}
