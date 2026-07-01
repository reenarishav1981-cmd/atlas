import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CMSBuilderService } from "@/lib/services/CMSBuilderService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "home";

  try {
    const page = await db.cmsPage.findUnique({
      where: { slug },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    return NextResponse.json({ page });
  } catch (error: any) {
    console.error("Failed to load CMS page:", error);
    return NextResponse.json({ error: "Failed to load page layout" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, slug, content, status } = body;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const existing = await db.cmsPage.findUnique({
      where: { slug },
    });

    let page;
    if (!existing) {
      page = await CMSBuilderService.createPage(
        title || "Homepage",
        slug,
        content || [],
        user.name
      );
    } else {
      page = await CMSBuilderService.updatePage(
        slug,
        {
          title: title || existing.title,
          content: content,
          status: status || "PUBLISHED",
        },
        user.name
      );
    }

    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    console.error("Failed to save CMS page:", error);
    return NextResponse.json({ error: error.message || "Failed to save page layout" }, { status: 500 });
  }
}
