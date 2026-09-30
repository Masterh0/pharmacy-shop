-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingAddress" TEXT,
ADD COLUMN     "shippingCity" TEXT,
ADD COLUMN     "shippingFullName" TEXT,
ADD COLUMN     "shippingNotes" TEXT,
ADD COLUMN     "shippingPhone" TEXT,
ADD COLUMN     "shippingPostalCode" TEXT,
ADD COLUMN     "shippingProvince" TEXT,
ADD COLUMN     "shippingStreet" TEXT;
