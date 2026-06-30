import { db } from "../db";
import { AuditService } from "./AuditService";

export interface MenuItem {
  label: string;
  url: string;
  children?: MenuItem[];
  isOpenInNewTab?: boolean;
}

export class NavigationService {
  /**
   * Retrieves a menu config tree by handle.
   */
  static async getMenu(handle: string) {
    return db.navigationMenu.findUnique({
      where: { handle },
    });
  }

  /**
   * Upsert a menu config structure and trigger audits.
   */
  static async updateMenu(handle: string, name: string, items: MenuItem[], updatedBy?: string) {
    const existing = await db.navigationMenu.findUnique({ where: { handle } });

    const menu = await db.navigationMenu.upsert({
      where: { handle },
      update: { name, items: JSON.parse(JSON.stringify(items)) },
      create: { handle, name, items: JSON.parse(JSON.stringify(items)) },
    });

    await AuditService.log({
      userId: updatedBy || "system",
      userName: updatedBy || "Navigation Manager",
      action: "UPDATE",
      entityType: "NavigationMenu",
      entityId: menu.id,
      oldValue: existing,
      newValue: menu,
    });

    return menu;
  }
}
