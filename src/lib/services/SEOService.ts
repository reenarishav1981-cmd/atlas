import { db } from "../db";
import { AuditService } from "./AuditService";

export class SEOService {
  /**
   * Check if a path redirect is configured.
   */
  static async getRedirect(sourcePath: string) {
    return db.seoRedirect.findUnique({
      where: { sourcePath },
    });
  }

  /**
   * Save a new redirect path.
   */
  static async createRedirect(sourcePath: string, targetPath: string, statusCode = 301, updatedBy?: string) {
    const redirect = await db.seoRedirect.upsert({
      where: { sourcePath },
      update: { targetPath, statusCode },
      create: { sourcePath, targetPath, statusCode },
    });

    await AuditService.log({
      userId: updatedBy || "system",
      userName: updatedBy || "SEO Manager",
      action: "CREATE",
      entityType: "SeoRedirect",
      entityId: redirect.id,
      newValue: redirect,
    });

    return redirect;
  }

  /**
   * Delete a redirect path.
   */
  static async deleteRedirect(id: string, deletedBy?: string) {
    const existing = await db.seoRedirect.findUnique({ where: { id } });
    if (!existing) return;

    await db.seoRedirect.delete({ where: { id } });

    await AuditService.log({
      userId: deletedBy || "system",
      userName: deletedBy || "SEO Manager",
      action: "DELETE",
      entityType: "SeoRedirect",
      entityId: id,
      oldValue: existing,
    });
  }
}
