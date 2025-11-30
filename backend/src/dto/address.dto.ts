import { z } from "zod";

export const createAddressSchema = z.object({
  fullName: z.string().min(2, "نام الزامی است"),
  phone: z
    .string()
    .regex(/^09\d{9}$/, "شماره موبایل معتبر نیست"),
  city: z.string().min(2, "شهر الزامی است"),
  street: z.string().min(2, "آدرس الزامی است"),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type CreateAddressDto = z.infer<typeof createAddressSchema>;

export const updateAddressSchema = createAddressSchema.partial();
export type UpdateAddressDto = z.infer<typeof updateAddressSchema>;
