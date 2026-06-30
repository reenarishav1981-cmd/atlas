import { db } from "../db";
import { AuditService } from "./AuditService";

export class MediaLibraryService {
  /**
   * Registers a new asset uploaded to CDN/Supabase Storage.
   */
  static async registerAsset(data: {
    name: string;
    url: string;
    mimeType: string;
    size: number;
    folder?: string;
    tags?: string[];
    checksum?: string;
  }, uploadedBy?: string) {
    const asset = await db.mediaAsset.create({
      data: {
        name: data.name,
        url: data.url,
        mimeType: data.mimeType,
        size: data.size,
        folder: data.folder || "/",
        tags: data.tags || [],
        checksum: data.checksum || null,
      },
    });

    await AuditService.log({
      userId: uploadedBy || "system",
      userName: uploadedBy || "Media Service",
      action: "CREATE",
      entityType: "MediaAsset",
      entityId: asset.id,
      newValue: asset,
    });

    return asset;
  }

  /**
   * Find duplicate files by checksum.
   */
  static async findDuplicates(checksum: string) {
    if (!checksum) return [];
    return db.mediaAsset.findMany({
      where: { checksum },
    });
  }

  /**
   * Query asset lists in a specific folder.
   */
  static async getAssetsByFolder(folder = "/") {
    return db.mediaAsset.findMany({
      where: { folder },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Deletes an asset record.
   */
  static async deleteAsset(id: string, deletedBy?: string) {
    const asset = await db.mediaAsset.findUnique({ where: { id } });
    if (!asset) return;

    await db.mediaAsset.delete({ where: { id } });

    await AuditService.log({
      userId: deletedBy || "system",
      userName: deletedBy || "Media Service",
      action: "DELETE",
      entityType: "MediaAsset",
      entityId: id,
      oldValue: asset,
    });
  }
}
