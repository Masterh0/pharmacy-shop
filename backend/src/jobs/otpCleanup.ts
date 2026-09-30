// src/jobs/otpCleanup.ts
import { prisma } from "../config/db";

export async function cleanupExpiredOtps() {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const deleteResult = await prisma.otp.deleteMany({
      where: {
        OR: [
          { used: true, createdAt: { lt: oneDayAgo } },
          { expiresAt: { lt: oneDayAgo } },
        ],
      },
    });
    console.info(`🧹 Cleaned up ${deleteResult.count} expired OTP records.`);
  } catch (error) {
    console.error("Failed to cleanup OTP records:", error);
  }
}
