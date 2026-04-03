/*
  Warnings:

  - You are about to drop the `FilterValue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FilterValue" DROP CONSTRAINT "FilterValue_filterId_fkey";

-- DropForeignKey
ALTER TABLE "FilterValue" DROP CONSTRAINT "FilterValue_storeId_fkey";

-- AlterTable
ALTER TABLE "Filter" ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "values" TEXT[];

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "diversity" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "isOnboarding" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "FilterValue";
