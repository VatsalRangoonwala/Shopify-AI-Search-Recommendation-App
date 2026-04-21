-- DropIndex
DROP INDEX "Product_attributes_gin_idx";

-- CreateTable
CREATE TABLE "NormalizedValue" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "productType" JSONB,
    "filterValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NormalizedValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NormalizedValue_storeId_key" ON "NormalizedValue"("storeId");

-- CreateIndex
CREATE INDEX "NormalizedValue_storeId_idx" ON "NormalizedValue"("storeId");

-- AddForeignKey
ALTER TABLE "NormalizedValue" ADD CONSTRAINT "NormalizedValue_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
