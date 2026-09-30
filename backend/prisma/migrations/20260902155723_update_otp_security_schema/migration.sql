/*
  Warnings:

  - You are about to drop the column `code` on the `Otp` table. All the data in the column will be lost.
  - The `purpose` column on the `Otp` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `codeHash` to the `Otp` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('LOGIN', 'REGISTER', 'PASSWORD_RESET');

-- DropIndex
DROP INDEX "Otp_phone_used_expiresAt_idx";

-- AlterTable
ALTER TABLE "Otp" DROP COLUMN "code",
ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "codeHash" TEXT NOT NULL,
ADD COLUMN     "lastAttemptAt" TIMESTAMP(3),
ADD COLUMN     "maxAttempts" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "usedAt" TIMESTAMP(3),
DROP COLUMN "purpose",
ADD COLUMN     "purpose" "OtpPurpose" NOT NULL DEFAULT 'LOGIN';

-- CreateIndex
CREATE INDEX "Otp_phone_purpose_used_expiresAt_idx" ON "Otp"("phone", "purpose", "used", "expiresAt");

-- CreateIndex
CREATE INDEX "Otp_createdAt_idx" ON "Otp"("createdAt");
