import { transliterate } from 'transliteration';

export const makeSlug = (text: string) => {
  if (!text) return "";

  // مرحله ۱: حذف فاصله‌های غیرضروری
  const trimmed = text.trim();

  // مرحله ۲: تبدیل کاراکترهای فارسی به انگلیسی قابل‌خواندن
  const latin = transliterate(trimmed);

  // مرحله ۳: جایگزینی فاصله با خط تیره و حذف کاراکترهای غیرمجاز
  const normalized = latin
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "") // اجازه به حروف فارسی+انگلیسی+اعداد
    .replace(/\s+/g, "-");

  // خروجی slug ترکیبی (مثلاً “مکمل-ورزشی-sport-supplement”)
  return normalized;
};
