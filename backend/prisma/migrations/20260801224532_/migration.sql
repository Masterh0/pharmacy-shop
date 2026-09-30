/*
  Warnings:

  - You are about to drop the column `productId` on the `InventoryLog` table. All the data in the column will be lost.
  - You are about to drop the column `expiryDate` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - Added the required column `variantId` to the `InventoryLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sku` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryLog" DROP CONSTRAINT "InventoryLog_productId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- DropIndex
DROP INDEX "InventoryLog_productId_idx";

-- DropIndex
DROP INDEX "Product_expiryDate_idx";

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "description" TEXT,
ADD COLUMN     "logo" TEXT;

-- AlterTable
ALTER TABLE "CartItem" ALTER COLUMN "productId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "description" TEXT,
ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "InventoryLog" DROP COLUMN "productId",
ADD COLUMN     "variantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "productName" TEXT NOT NULL,
ADD COLUMN     "sku" TEXT NOT NULL,
ADD COLUMN     "variantName" TEXT,
ALTER COLUMN "productId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "expiryDate",
DROP COLUMN "price",
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "shortDescription" TEXT;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "purchasePrice" DECIMAL(12,2);

-- CreateIndex
CREATE INDEX "InventoryLog_variantId_idx" ON "InventoryLog"("variantId");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLog" ADD CONSTRAINT "InventoryLog_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
