import { z } from "zod";
import { db } from "../db";
import { CompleteBlockSchema, BlockInstance } from "../types/blocks";
import { AuditService } from "./AuditService";

export class CMSBuilderService {
  /**
   * Validate a list of block configurations before saving.
   */
  static validateBlocks(blocks: any[]): BlockInstance[] {
    const validated: BlockInstance[] = [];
    for (const block of blocks) {
      const parsed = CompleteBlockSchema.safeParse(block);
      if (!parsed.success) {
        throw new Error(`Block validation failed for type "${block.type}": ${JSON.stringify(parsed.error.flatten())}`);
      }
      validated.push(parsed.data);
    }
    return validated;
  }

  /**
   * Retrieve a page layout configuration by slug.
   * Gated: handles status, scheduling checks, and active display duration filtering.
   */
  static async getPage(slug: string, preview = false) {
    const page = await db.cmsPage.findUnique({
      where: { slug },
    });

    if (!page) return null;

    if (!preview) {
      // Exclude archived pages
      if (page.status === "ARCHIVED") return null;

      // Scheduling validation
      if (page.status === "DRAFT") return null;

      const now = new Date();
      if (page.scheduledStart && page.scheduledStart > now) return null;
      if (page.scheduledEnd && page.scheduledEnd < now) return null;
    }

    return page;
  }

  /**
   * Create a new custom page with verified block configurations.
   */
  static async createPage(title: string, slug: string, content: any[], createdBy?: string) {
    const validatedContent = this.validateBlocks(content);

    const page = await db.cmsPage.create({
      data: {
        title,
        slug,
        content: JSON.parse(JSON.stringify(validatedContent)),
        status: "DRAFT",
      },
    });

    await AuditService.log({
      userId: createdBy || "system",
      userName: createdBy || "CMS Builder",
      action: "CREATE",
      entityType: "CmsPage",
      entityId: page.id,
      newValue: page,
    });

    // Create initial version
    await this.savePageVersion(page.id, page.content, page.title, createdBy || "system");

    return page;
  }

  /**
   * Update a page layout block configuration.
   * Compiles layout modifications, verifies Zod contracts, logs changes, and creates a version entry.
   */
  static async updatePage(
    slug: string,
    updates: { title?: string; content?: any[]; status?: string; scheduledStart?: Date | null; scheduledEnd?: Date | null; metaTitle?: string | null; metaDescription?: string | null },
    updatedBy?: string
  ) {
    const existing = await db.cmsPage.findUnique({
      where: { slug },
    });

    if (!existing) {
      throw new Error(`Page not found with slug: ${slug}`);
    }

    let finalContent = existing.content;
    if (updates.content) {
      finalContent = JSON.parse(JSON.stringify(this.validateBlocks(updates.content)));
    }

    const updated = await db.cmsPage.update({
      where: { slug },
      data: {
        title: updates.title ?? existing.title,
        content: finalContent as any,
        status: updates.status ?? existing.status,
        scheduledStart: updates.scheduledStart !== undefined ? updates.scheduledStart : existing.scheduledStart,
        scheduledEnd: updates.scheduledEnd !== undefined ? updates.scheduledEnd : existing.scheduledEnd,
        metaTitle: updates.metaTitle ?? existing.metaTitle,
        metaDescription: updates.metaDescription ?? existing.metaDescription,
      },
    });

    await AuditService.log({
      userId: updatedBy || "system",
      userName: updatedBy || "CMS Builder",
      action: "UPDATE",
      entityType: "CmsPage",
      entityId: updated.id,
      oldValue: existing,
      newValue: updated,
    });

    // Save a new version if contents or title modified
    if (updates.content || updates.title) {
      await this.savePageVersion(updated.id, updated.content, updated.title, updatedBy || "system");
    }

    return updated;
  }

  /**
   * Generates a structural snapshot in the CmsPageVersion history table.
   */
  private static async savePageVersion(pageId: string, content: any, title: string, createdByName: string) {
    const lastVersion = await db.cmsPageVersion.findFirst({
      where: { cmsPageId: pageId },
      orderBy: { version: "desc" },
    });

    const nextVer = lastVersion ? lastVersion.version + 1 : 1;

    await db.cmsPageVersion.create({
      data: {
        cmsPageId: pageId,
        content,
        title,
        version: nextVer,
        createdByName,
      },
    });
  }

  /**
   * Retrieves structural changes log list for a page.
   */
  static async getPageVersions(slug: string) {
    const page = await db.cmsPage.findUnique({ where: { slug }, select: { id: true } });
    if (!page) return [];

    return db.cmsPageVersion.findMany({
      where: { cmsPageId: page.id },
      orderBy: { version: "desc" },
    });
  }

  /**
   * Performs an immediate rollback to an older version.
   */
  static async rollbackVersion(slug: string, versionId: string, updatedBy?: string) {
    const targetVersion = await db.cmsPageVersion.findUnique({
      where: { id: versionId },
    });

    if (!targetVersion) {
      throw new Error(`Target page version not found: ${versionId}`);
    }

    const updated = await this.updatePage(
      slug,
      {
        title: targetVersion.title,
        content: targetVersion.content as any,
      },
      updatedBy
    );

    return updated;
  }
}
