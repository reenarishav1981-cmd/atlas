-- CreateTable
CREATE TABLE "ThemeSettings" (
    "id" TEXT NOT NULL DEFAULT 'active',
    "name" TEXT NOT NULL DEFAULT 'Default Theme',
    "colors" JSONB NOT NULL,
    "typography" JSONB NOT NULL,
    "layout" JSONB NOT NULL,
    "branding" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemeSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThemeSettingsVersion" (
    "id" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "colors" JSONB NOT NULL,
    "typography" JSONB NOT NULL,
    "layout" JSONB NOT NULL,
    "branding" JSONB NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThemeSettingsVersion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ThemeSettingsVersion" ADD CONSTRAINT "ThemeSettingsVersion_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "ThemeSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
