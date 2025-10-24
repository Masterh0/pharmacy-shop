import { z } from "zod";

export const variantSchema = z.object({
  packageQuantity: z.number().min(1, "تعداد بسته حداقل ۱ باید باشد"),
  packageType: z.string().min(1, "نوع بسته‌بندی الزامی است"),
  price: z.number().min(0, "قیمت نمی‌تواند منفی باشد"),
  stock: z.number().min(0, "موجودی نمی‌تواند منفی باشد"),
  discountPrice: z.number().optional(),
  expiryDate: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "نام محصول الزامی است"),
  slug: z.string().optional(),
  sku: z.string().optional(),
  description: z.string().optional(),
  brandId: z.number().optional(),
  categoryId: z.number().optional(),
  isBlock: z.boolean().optional(),
  image: z.any().optional(),
  variants: z
    .array(variantSchema)
    .min(1, "حداقل یک واریانت باید وجود داشته باشد"),
});

export type CreateProductDTO = z.infer<typeof productSchema>;
