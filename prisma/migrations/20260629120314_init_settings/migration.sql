-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Setting_namespace_idx" ON "Setting"("namespace");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_namespace_key_key" ON "Setting"("namespace", "key");
