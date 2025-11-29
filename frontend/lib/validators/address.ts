import { z } from "zod";

export const addressClientSchema = z.object({
  fullName: z
    .string()
    .min(3, "نام و نام خانوادگی لازم است"),

  phone: z
    .string()
    .regex(/^09\d{9}$/, "شماره موبایل معتبر نیست"),

  province: z
    .string()
    .min(2, "استان را انتخاب کنید"),

  city: z
    .string()
    .min(2, "شهر را انتخاب کنید"),

  postalCode: z
    .string()
    .length(10, "کد پستی باید ۱۰ رقم باشد"),

  street: z
    .string()
    .min(5, "آدرس کامل را وارد کنید"),

  isDefault: z.boolean().optional(),

  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
});

export type AddressClientInput = z.infer<typeof addressClientSchema>;
