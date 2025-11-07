import { z } from "zod";

/* ----------------------------------------------------- */
/* 🎯 واریانت — تبدیل فقط برای قیمت‌ها                  */
/* ----------------------------------------------------- */
export const variantSchema = z
  .object({
    packageQuantity: z.number().min(1, "تعداد بسته حداقل ۱ باید باشد"),
    packageType: z.string().min(1, "نوع بسته‌بندی الزامی است"),

    price: z
      .string()
      .transform((val) => {
        const num = Number(val.replace(/,/g, ""));
        return isNaN(num) ? 0 : num; // فقط تبدیل رشته کامادار به عدد
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
  })
  // 🧩 منطق اضافی: بررسی اختلاف قیمت‌ها
  .refine(
    (data) =>
      data.discountPrice === undefined || data.discountPrice < data.price,
    {
      message: "قیمت با تخفیف نمی‌تواند از قیمت اصلی بیشتر باشد",
      path: ["discountPrice"], // خطا برای فیلد خود تخفیف نمایش داده شود
    }
  );

/* ----------------------------------------------------- */
/* 🎯 محصول — اسکیمای نهایی برای ارسال به API            */
/* ----------------------------------------------------- */
export const productSchema = z.object({
  name: z.string().min(1, "نام محصول الزامی است"),
  slug: z.string().optional(),
  sku: z.string().min(1, "کد SKU الزامی است"),
  description: z.string().optional(),
  brandId: z.number().optional(),
  categoryId: z.number().optional(),
  isBlock: z.boolean().optional(),
  image: z.any().optional(),

  variants: z
    .array(variantSchema)
    .min(1, "حداقل یک واریانت باید وجود داشته باشد"),
});
export const editProductSchema = z.object({
  name: z.string().min(1, "نام محصول الزامی است"),
  slug: z.string().optional(),
  sku: z.string().min(1, "کد SKU الزامی است"),
  description: z.string().optional(),
  brandId: z.coerce.number().optional(),
  categoryId: z.coerce.number().optional(),
  isBlock: z.boolean().optional(),
  image: z.any().optional(),
});
export type CreateProductDTO = z.infer<typeof productSchema>;
