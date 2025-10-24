import { z } from "zod";

export const variantSchema = z.object({
  packageType: z.string().nonempty("نوع بسته‌بندی الزامی است"),
  packageQuantity: z.number().positive("تعداد باید عدد مثبت باشد"),
  price: z.number().min(0, "قیمت الزامی است"),
  discountPrice: z.number().optional(),
  stock: z.number().min(0, "موجودی الزامی است"),
  expiryDate: z.string().optional(),
});

export type CreateVariantDTO = z.infer<typeof variantSchema>;
