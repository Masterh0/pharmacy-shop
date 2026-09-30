-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "brandName" TEXT,
ADD COLUMN     "categoryName" TEXT;

-- CreateIndex
CREATE INDEX "ProductVariant_stock_idx" ON "ProductVariant"("stock");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");
