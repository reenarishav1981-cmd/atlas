import { z } from "zod";
import { db } from "../db";
import { AuditService } from "./AuditService";

// Define strong Zod validation schemas for settings groups
export const GeneralSettingsSchema = z.object({
  siteName: z.string().min(1).max(60).default("ATLAS"),
  footerText: z.string().max(200).default("© ATLAS. All rights reserved."),
});

export const PaymentSettingsSchema = z.object({
  razorpayKeyId: z.string().optional().default(""),
  codEnabled: z.boolean().default(true),
});

export type GeneralSettings = z.infer<typeof GeneralSettingsSchema>;
export type PaymentSettings = z.infer<typeof PaymentSettingsSchema>;

export class SettingsRegistryService {
  /**
   * Resolves schema validation for a namespace.
   */
  private static getNamespaceSchema(namespace: string): z.ZodSchema<any> {
    switch (namespace) {
      case "general":
        return GeneralSettingsSchema;
      case "payment":
        return PaymentSettingsSchema;
      default:
        return z.record(z.any());
    }
  }

  /**
   * Retrieves default configurations for a namespace.
   */
  private static getNamespaceDefaults(namespace: string): Record<string, any> {
    switch (namespace) {
      case "general":
        return GeneralSettingsSchema.parse({});
      case "payment":
        return PaymentSettingsSchema.parse({});
      default:
        return {};
    }
  }

  /**
   * Resolves the active setting value by evaluating dynamic database values
   * and checking environment overrides formatted as: ATLAS_SETTINGS_[NAMESPACE]_[KEY]
   */
  static async get(namespace: string, key: string): Promise<any> {
    // 1. Check environment override first (e.g. ATLAS_SETTINGS_GENERAL_SITENAME)
    const envKey = `ATLAS_SETTINGS_${namespace.toUpperCase()}_${key.toUpperCase()}`;
    if (process.env[envKey] !== undefined) {
      const envVal = process.env[envKey];
      // Simple parse for boolean/number
      if (envVal === "true") return true;
      if (envVal === "false") return false;
      if (!isNaN(Number(envVal)) && envVal.trim() !== "") return Number(envVal);
      return envVal;
    }

    // 2. Query setting from database
    const record = await db.setting.findUnique({
      where: { namespace_key: { namespace, key } },
    });

    if (record) {
      return record.value;
    }

    // 3. Fallback to default schema configurations
    const defaults = this.getNamespaceDefaults(namespace);
    return defaults[key];
  }

  /**
   * Retrieves the entire compiled object configuration for a namespace.
   */
  static async getNamespace(namespace: string): Promise<Record<string, any>> {
    const defaults = this.getNamespaceDefaults(namespace);
    const records = await db.setting.findMany({
      where: { namespace },
    });

    const config = { ...defaults };
    for (const r of records) {
      config[r.key] = r.value;
    }

    // Check environment overrides for every key in the resolved config
    for (const k of Object.keys(config)) {
      const envKey = `ATLAS_SETTINGS_${namespace.toUpperCase()}_${k.toUpperCase()}`;
      if (process.env[envKey] !== undefined) {
        const envVal = process.env[envKey]!;
        if (envVal === "true") config[k] = true;
        else if (envVal === "false") config[k] = false;
        else if (!isNaN(Number(envVal)) && envVal.trim() !== "") config[k] = Number(envVal);
        else config[k] = envVal;
      }
    }

    return config;
  }

  /**
   * Sets a single configuration key in a namespace.
   * Performs validation schema checks and writes audit logs.
   */
  static async set(
    namespace: string,
    key: string,
    value: any,
    updatedBy?: string
  ): Promise<any> {
    const schema = this.getNamespaceSchema(namespace);
    const defaults = this.getNamespaceDefaults(namespace);
    
    // Validate the proposed value structure
    const currentNamespaceConfig = await this.getNamespace(namespace);
    const newNamespaceConfig = { ...currentNamespaceConfig, [key]: value };

    const parsed = schema.safeParse(newNamespaceConfig);
    if (!parsed.success) {
      throw new Error(`Settings validation failed: ${JSON.stringify(parsed.error.flatten())}`);
    }

    const oldValueRecord = await db.setting.findUnique({
      where: { namespace_key: { namespace, key } },
    });
    const oldValue = oldValueRecord ? oldValueRecord.value : defaults[key];

    const result = await db.setting.upsert({
      where: { namespace_key: { namespace, key } },
      update: { value, updatedBy },
      create: { namespace, key, value, updatedBy },
    });

    // Write audit log entry
    await AuditService.log({
      userId: updatedBy || "system",
      userName: updatedBy || "Settings Registry",
      action: "UPDATE",
      entityType: "Setting",
      entityId: `${namespace}:${key}`,
      oldValue: { [key]: oldValue },
      newValue: { [key]: value },
    });

    return result;
  }

  /**
   * Performs batch setting updates within a namespace.
   */
  static async setBatch(
    namespace: string,
    updates: Record<string, any>,
    updatedBy?: string
  ): Promise<void> {
    const schema = this.getNamespaceSchema(namespace);
    const currentConfig = await this.getNamespace(namespace);
    const newConfig = { ...currentConfig, ...updates };

    const parsed = schema.safeParse(newConfig);
    if (!parsed.success) {
      throw new Error(`Batch settings validation failed: ${JSON.stringify(parsed.error.flatten())}`);
    }

    await db.$transaction(async (tx) => {
      for (const [key, value] of Object.entries(updates)) {
        const oldValueRecord = await tx.setting.findUnique({
          where: { namespace_key: { namespace, key } },
        });
        const oldValue = oldValueRecord ? oldValueRecord.value : currentConfig[key];

        await tx.setting.upsert({
          where: { namespace_key: { namespace, key } },
          update: { value, updatedBy },
          create: { namespace, key, value, updatedBy },
        });

        // Trigger audit logs inside transaction
        await AuditService.log({
          userId: updatedBy || "system",
          userName: updatedBy || "Settings Registry",
          action: "UPDATE",
          entityType: "Setting",
          entityId: `${namespace}:${key}`,
          oldValue: { [key]: oldValue },
          newValue: { [key]: value },
        });
      }
    });
  }
}
