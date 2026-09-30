// src/middlewares/rateLimiter.ts
import rateLimit from "express-rate-limit";

// ۱. محدودکننده ارسال OTP (Resend Limiter per IP)
export const otpSendRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقیقه
  max: 5, // حداکثر ۵ درخواست ارسال در هر ۱۵ دقیقه به ازای هر IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "تعداد درخواست‌های ارسال کد بیش از حد مجاز است. لطفاً ۱۵ دقیقه دیگر تلاش کنید.",
  },
});

// ۲. محدودکننده بررسی OTP (Verify Limiter per IP)
export const otpVerifyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, // حداکثر ۱۵ درخواست بررسی کد در هر ۱۵ دقیقه به ازای هر IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "تعداد دفعات بررسی کد بیش از حد مجاز است. لطفاً بعداً تلاش کنید.",
  },
});
