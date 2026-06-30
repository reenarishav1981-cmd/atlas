import { db } from "./db";

/**
 * Auto-creates the singleton settings row on first read so the site never
 * breaks just because no admin has opened Settings yet — it just shows
 * sensible defaults (defined in prisma/schema.prisma) until edited.
 */
export async function getSiteSettings() {
  return db.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });
}
