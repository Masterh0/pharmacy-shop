import slugify from "slugify";

export function makeSlug(input: string): string {
  return slugify(input, {
    lower: true, // همه حروف کوچک
    strict: true, // حذف کاراکترهای غیرمجاز
    locale: "fa", // ساپورت فارسی
  });
}
