import { db } from "../db";

export class RBACService {
  /**
   * Evaluates if a user role matches a required permission key.
   * Supports wildcard checks e.g., 'catalog:*' matches 'catalog:read' and 'catalog:write'.
   */
  static hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    if (userPermissions.includes("*")) return true;

    // Direct match
    if (userPermissions.includes(requiredPermission)) return true;

    // Wildcard match e.g., 'catalog:*' matches 'catalog:read'
    const parts = requiredPermission.split(":");
    if (parts.length > 1) {
      const scopeWildcard = `${parts[0]}:*`;
      if (userPermissions.includes(scopeWildcard)) return true;
    }

    return false;
  }

  /**
   * Resolve a user's combined permissions.
   * Seamlessly resolves legacy enum roles to default perm maps if no custom roleId is set.
   */
  static async resolveUserPermissions(user: {
    id: string;
    role: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
    roleId?: string | null;
  }): Promise<string[]> {
    // If user has a custom role assigned in db, load its permissions
    if (user.roleId) {
      const dbRole = await db.userRole.findUnique({
        where: { id: user.roleId },
      });
      if (dbRole) {
        return dbRole.permissions;
      }
    }

    // Fallback to legacy schema defaults to preserve backwards compatibility
    switch (user.role) {
      case "SUPER_ADMIN":
        return ["*"];
      case "ADMIN":
        return [
          "catalog:*",
          "orders:*",
          "cms:*",
          "settings:*",
          "crm:*",
          "marketing:*",
        ];
      case "CUSTOMER":
      default:
        return ["storefront:read"];
    }
  }

  /**
   * Verify if a specific user ID holds the required permission key.
   */
  static async userHasPermission(userId: string, requiredPermission: string): Promise<boolean> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, roleId: true },
    });

    if (!user) return false;

    const perms = await this.resolveUserPermissions(user);
    return this.hasPermission(perms, requiredPermission);
  }

  /**
   * Create a new administrative role with permissions list.
   */
  static async createRole(name: string, permissions: string[]) {
    return db.userRole.upsert({
      where: { name },
      update: { permissions },
      create: { name, permissions },
    });
  }

  /**
   * Assign a roleId override to a user.
   */
  static async assignRole(userId: string, roleId: string | null) {
    return db.user.update({
      where: { id: userId },
      data: { roleId },
    });
  }

  /**
   * List all system user roles.
   */
  static async getAllRoles() {
    return db.userRole.findMany({
      orderBy: { name: "asc" },
    });
  }
}
