import { db } from "../db";

export class AuditService {
  /**
   * Logs a database mutation or system event.
   */
  static async log({
    userId,
    userName,
    action,
    entityType,
    entityId,
    oldValue,
    newValue,
    ipAddress,
  }: {
    userId?: string | null;
    userName?: string | null;
    action: string;
    entityType: string;
    entityId: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string | null;
  }): Promise<void> {
    try {
      await db.auditLog.create({
        data: {
          userId: userId || null,
          userName: userName || null,
          action,
          entityType,
          entityId,
          oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
          newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
          ipAddress: ipAddress || null,
        },
      });
    } catch (e) {
      console.error("Audit log failed to write to database", e);
    }
  }

  /**
   * Retrieves audit logs with optional filter patterns.
   */
  static async getLogs(filters?: {
    entityType?: string;
    entityId?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }) {
    return db.auditLog.findMany({
      where: {
        entityType: filters?.entityType,
        entityId: filters?.entityId,
        userId: filters?.userId,
      },
      orderBy: { createdAt: "desc" },
      take: filters?.limit ?? 100,
      skip: filters?.offset ?? 0,
    });
  }
}
