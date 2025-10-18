/*
  Warnings:

  - You are about to drop the column `barcode` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `dosageForm` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `gtin` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `isPrescriptionRequired` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `minStock` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `originCountry` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `packSize` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `strength` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `Product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Product_isPrescriptionRequired_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "barcode",
DROP COLUMN "dosageForm",
DROP COLUMN "gtin",
DROP COLUMN "isPrescriptionRequired",
DROP COLUMN "minStock",
DROP COLUMN "originCountry",
DROP COLUMN "packSize",
DROP COLUMN "price",
DROP COLUMN "stock",
DROP COLUMN "strength",
DROP COLUMN "unit";

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "packageQuantity" INTEGER NOT NULL,
    "packageType" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "discountPrice" DECIMAL(12,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "expiryDate" TIMESTAMP(3),

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
