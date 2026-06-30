import { db } from "../db";
import { AuditService } from "./AuditService";

export class CRMService {
  /**
   * Fetch customer profile, automatically creating it if missing.
   */
  static async getCustomerProfile(userId: string) {
    return db.customerProfile.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        notes: "",
        tags: [],
        segments: ["All Customers"],
      },
      include: {
        user: true,
      },
    });
  }

  /**
   * Update customer notes, tags, or segment filters.
   */
  static async updateCustomerProfile(
    userId: string,
    updates: { notes?: string; tags?: string[]; segments?: string[] },
    updatedBy?: string
  ) {
    const existing = await this.getCustomerProfile(userId);

    const updated = await db.customerProfile.update({
      where: { userId },
      data: {
        notes: updates.notes !== undefined ? updates.notes : existing.notes,
        tags: updates.tags || existing.tags,
        segments: updates.segments || existing.segments,
      },
      include: {
        user: true,
      },
    });

    await AuditService.log({
      userId: updatedBy || "system",
      userName: updatedBy || "CRM Manager",
      action: "UPDATE",
      entityType: "CustomerProfile",
      entityId: userId,
      oldValue: existing,
      newValue: updated,
    });

    return updated;
  }
}
