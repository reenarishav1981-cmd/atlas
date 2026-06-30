import { db } from "../db";

export class FeatureFlagService {
  /**
   * Check if a feature flag is enabled.
   */
  static async isEnabled(key: string): Promise<boolean> {
    try {
      const flag = await db.featureFlag.findUnique({
        where: { key },
      });
      return flag?.isEnabled ?? false;
    } catch (e) {
      console.error(`Failed to read feature flag: ${key}`, e);
      return false;
    }
  }

  /**
   * Set the status of a feature flag.
   */
  static async setFlag(key: string, isEnabled: boolean, description?: string): Promise<void> {
    await db.featureFlag.upsert({
      where: { key },
      update: { isEnabled, description },
      create: { key, isEnabled, description },
    });
  }

  /**
   * Get all registered feature flags.
   */
  static async getAllFlags() {
    return db.featureFlag.findMany({
      orderBy: { key: "asc" },
    });
  }
}
