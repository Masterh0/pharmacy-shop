/*
  Warnings:

  - You are about to drop the column `attempts` on the `Otp` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `Otp` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Otp" DROP COLUMN "attempts",
DROP COLUMN "isVerified",
ADD COLUMN     "purpose" TEXT NOT NULL DEFAULT 'login';

-- CreateIndex
CREATE INDEX "Otp_phone_used_expiresAt_idx" ON "Otp"("phone", "used", "expiresAt");
