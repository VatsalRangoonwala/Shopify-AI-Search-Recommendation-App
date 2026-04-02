/*
  Warnings:

  - You are about to drop the column `field` on the `Filter` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Filter` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Filter` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `Filter` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Filter` table. All the data in the column will be lost.
  - You are about to drop the column `values` on the `Filter` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[storeId,key]` on the table `Filter` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,shopifyProductId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `Filter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `Filter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `Filter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Filter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopifyGraphqlId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopifyProductId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Filter" DROP CONSTRAINT "Filter_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_storeId_fkey";

-- AlterTable
ALTER TABLE "Filter" DROP COLUMN "field",
DROP COLUMN "isActive",
DROP COLUMN "name",
DROP COLUMN "position",
DROP COLUMN "type",
DROP COLUMN "values",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "label" TEXT NOT NULL,
ADD COLUMN     "productCount" INTEGER,
ADD COLUMN     "source" TEXT NOT NULL,
ADD COLUMN     "sourceField" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'detected',
ADD COLUMN     "uniqueCount" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "valueType" TEXT,
ALTER COLUMN "uiType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "price",
ADD COLUMN     "attributes" JSONB,
ADD COLUMN     "availableForSale" BOOLEAN,
ADD COLUMN     "bodyHtml" TEXT,
ADD COLUMN     "compareAtMaxPrice" DOUBLE PRECISION,
ADD COLUMN     "compareAtMinPrice" DOUBLE PRECISION,
ADD COLUMN     "createdAtShopify" TIMESTAMP(3),
ADD COLUMN     "featuredImage" TEXT,
ADD COLUMN     "handle" TEXT,
ADD COLUMN     "images" JSONB,
ADD COLUMN     "maxPrice" DOUBLE PRECISION,
ADD COLUMN     "metafields" JSONB,
ADD COLUMN     "minPrice" DOUBLE PRECISION,
ADD COLUMN     "options" JSONB,
ADD COLUMN     "productType" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "shopifyGraphqlId" TEXT NOT NULL,
ADD COLUMN     "shopifyProductId" TEXT NOT NULL,
ADD COLUMN     "status" TEXT,
ADD COLUMN     "totalInventory" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAtShopify" TIMESTAMP(3),
ADD COLUMN     "variants" JSONB,
ADD COLUMN     "vendor" TEXT;

-- CreateTable
CREATE TABLE "FilterValue" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "filterId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "productCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FilterValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FilterValue_storeId_idx" ON "FilterValue"("storeId");

-- CreateIndex
CREATE INDEX "FilterValue_filterId_idx" ON "FilterValue"("filterId");

-- CreateIndex
CREATE UNIQUE INDEX "FilterValue_filterId_normalized_key" ON "FilterValue"("filterId", "normalized");

-- CreateIndex
CREATE INDEX "Filter_storeId_idx" ON "Filter"("storeId");

-- CreateIndex
CREATE INDEX "Filter_storeId_status_idx" ON "Filter"("storeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Filter_storeId_key_key" ON "Filter"("storeId", "key");

-- CreateIndex
CREATE INDEX "Product_storeId_idx" ON "Product"("storeId");

-- CreateIndex
CREATE INDEX "Product_storeId_vendor_idx" ON "Product"("storeId", "vendor");

-- CreateIndex
CREATE INDEX "Product_storeId_productType_idx" ON "Product"("storeId", "productType");

-- CreateIndex
CREATE UNIQUE INDEX "Product_storeId_shopifyProductId_key" ON "Product"("storeId", "shopifyProductId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Filter" ADD CONSTRAINT "Filter_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilterValue" ADD CONSTRAINT "FilterValue_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilterValue" ADD CONSTRAINT "FilterValue_filterId_fkey" FOREIGN KEY ("filterId") REFERENCES "Filter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
