// src/utils/otp.ts
import crypto from "crypto";

const OTP_SECRET =
  process.env.OTP_SECRET || "fallback-insecure-secret-change-in-prod";

if (
  process.env.NODE_ENV === "production" &&
  (!process.env.OTP_SECRET || process.env.OTP_SECRET.length < 32)
) {
  throw new Error(
    "❌ OTP_SECRET محیطی تعریف نشده یا طول آن کمتر از ۳۲ کاراکتر است.",
  );
}

/**
 * تبدیل ارقام فارسی و عربی به ارقام انگلیسی
 */
export function toEnglishDigits(str: string): string {
  if (!str) return "";
  return str
    .replace(/[۰-۹]/g, (d) => (d.charCodeAt(0) - 1776).toString())
    .replace(/[٠-٩]/g, (d) => (d.charCodeAt(0) - 1632).toString());
}

/**
 * نرمال‌سازی شماره موبایل ایرانی (فرمت خروجی: 0912XXXXXXX)
 */
export function normalizePhone(input: string): string {
  if (!input) return "";
  let phone = toEnglishDigits(input)
    .replace(/[\s\-]/g, "")
    .trim();
  if (phone.startsWith("+")) phone = phone.slice(1);
  if (phone.startsWith("0098")) phone = phone.slice(4);
  else if (phone.startsWith("98")) phone = phone.slice(2);
  if (phone.length === 10 && phone.startsWith("9")) phone = "0" + phone;
  return phone.replace(/\D/g, "");
}

/**
 * تولید امن کد ۶ رقمی
 */
export function generateSecureOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * محاسبه هش HMAC-SHA256 کد
 * استفاده از phone به عنوان salt اضافی برای جلوگیری کامل از Rainbow Tables
 */
export function hashOtpCode(phone: string, code: string): string {
  const normalizedCode = toEnglishDigits(code).trim();
  const normalizedPhone = normalizePhone(phone);

  return crypto
    .createHmac("sha256", OTP_SECRET)
    .update(`${normalizedPhone}:${normalizedCode}`)
    .digest("hex");
}

/**
 * مقایسه دو هش به شیوه مقاوم در برابر حملات تحلیل زمانی (Timing Attacks)
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
