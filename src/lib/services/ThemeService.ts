import { db } from "../db";
import { AuditService } from "./AuditService";

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
  };
  typography: {
    fontSans: string;
  };
  layout: {
    borderRadius: string;
    containerWidth: string;
  };
  branding: {
    logoUrl?: string;
    faviconUrl?: string;
  };
}

const DEFAULT_THEME: ThemeConfig = {
  colors: {
    primary: "#C4973A",
    secondary: "#0A0A09",
    background: "#F4F3F0",
    foreground: "#0E0E0D",
  },
  typography: {
    fontSans: "Inter, system-ui, sans-serif",
  },
  layout: {
    borderRadius: "12px",
    containerWidth: "1200px",
  },
  branding: {
    logoUrl: "",
    faviconUrl: "",
  },
};

export class ThemeService {
  /**
   * Resolve active theme settings. Auto-seeds defaults if none exists.
   */
  static async getTheme() {
    return db.themeSettings.upsert({
      where: { id: "active" },
      update: {},
      create: {
        id: "active",
        name: "Default Active Theme",
        colors: DEFAULT_THEME.colors,
        typography: DEFAULT_THEME.typography,
        layout: DEFAULT_THEME.layout,
        branding: DEFAULT_THEME.branding as any,
      },
    });
  }

  /**
   * Save theme modifications, trigger audit logs, and record version logs.
   */
  static async updateTheme(
    updates: { colors?: any; typography?: any; layout?: any; branding?: any; name?: string },
    updatedBy?: string
  ) {
    const existing = await this.getTheme();

    const updated = await db.themeSettings.update({
      where: { id: "active" },
      data: {
        name: updates.name ?? existing.name,
        colors: updates.colors ?? existing.colors,
        typography: updates.typography ?? existing.typography,
        layout: updates.layout ?? existing.layout,
        branding: updates.branding ?? existing.branding,
      },
    });

    await AuditService.log({
      userId: updatedBy || "system",
      userName: updatedBy || "Theme Engine",
      action: "UPDATE",
      entityType: "ThemeSettings",
      entityId: "active",
      oldValue: existing,
      newValue: updated,
    });

    // Save snapshot to history
    await this.saveThemeVersion(updated, updatedBy || "system");

    return updated;
  }

  /**
   * Compiles theme settings into raw inline CSS variables injected into root layouts.
   */
  static compileCssVariables(theme: any): string {
    const colors = (theme.colors as ThemeConfig["colors"]) || DEFAULT_THEME.colors;
    const typography = (theme.typography as ThemeConfig["typography"]) || DEFAULT_THEME.typography;
    const layout = (theme.layout as ThemeConfig["layout"]) || DEFAULT_THEME.layout;

    return `
      :root {
        --color-primary: ${colors.primary};
        --color-secondary: ${colors.secondary};
        --color-background: ${colors.background};
        --color-foreground: ${colors.foreground};
        --font-sans: ${typography.fontSans};
        --border-radius-theme: ${layout.borderRadius};
        --container-width-theme: ${layout.containerWidth};
      }
    `;
  }

  /**
   * Saves a version snapshot to history.
   */
  private static async saveThemeVersion(theme: any, createdByName: string) {
    const lastVersion = await db.themeSettingsVersion.findFirst({
      where: { themeId: theme.id },
      orderBy: { version: "desc" },
    });

    const nextVer = lastVersion ? lastVersion.version + 1 : 1;

    await db.themeSettingsVersion.create({
      data: {
        themeId: theme.id,
        version: nextVer,
        colors: theme.colors,
        typography: theme.typography,
        layout: theme.layout,
        branding: theme.branding,
        createdByName,
      },
    });
  }

  /**
   * Lists all historical theme logs.
   */
  static async getThemeVersions() {
    return db.themeSettingsVersion.findMany({
      where: { themeId: "active" },
      orderBy: { version: "desc" },
    });
  }

  /**
   * Rolls back styling configuration.
   */
  static async rollbackVersion(versionId: string, updatedBy?: string) {
    const target = await db.themeSettingsVersion.findUnique({
      where: { id: versionId },
    });

    if (!target) {
      throw new Error(`Target theme version not found: ${versionId}`);
    }

    return this.updateTheme(
      {
        colors: target.colors,
        typography: target.typography,
        layout: target.layout,
        branding: target.branding,
      },
      updatedBy
    );
  }
}
