import { z } from "zod";

/**
 * Schema برای واریانت محصول
 * قیمت‌ها به صورت string از API می‌آیند اما در فرم به number تبدیل می‌شوند
 */
export const variantSchema = z.object({
  packageType: z.string().min(1, "نوع بسته‌بندی الزامی است"),
  packageQuantity: z.number().positive("تعداد باید عدد مثبت باشد"),
  price: z
    .string()
    .transform((val) => {
      const num = Number(val.replace(/,/g, ""));
      return isNaN(num) ? 0 : num;
    })
    .refine((val) => val > 0, "قیمت باید عدد معتبر باشد"),
  discountPrice: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const num = Number(val.replace(/,/g, ""));
      return isNaN(num) ? undefined : num;
    }),
  stock: z.number().min(0, "موجودی نمی‌تواند منفی باشد"),
  expiryDate: z.string().optional(),
  flavor: z.string().optional().nullable(),
})
  // بررسی منطقی: قیمت تخفیفی باید کمتر از قیمت اصلی باشد
  .refine(
    (data) =>
      data.discountPrice === undefined || data.discountPrice < data.price,
    {
      message: "قیمت با تخفیف نمی‌تواند از قیمت اصلی بیشتر باشد",
      path: ["discountPrice"],
    }
  );

export type CreateVariantDTO = z.infer<typeof variantSchema>;
