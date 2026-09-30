import { z } from "zod";

/* ----------------------------------------------------- */
/* Helpers                                               */
/* ----------------------------------------------------- */

const priceField = z.any().transform((val) => {
  if (val === "" || val === null || val === undefined) return undefined;

  if (typeof val === "number") return val;

  if (typeof val === "string") {
    const num = Number(val.replace(/,/g, ""));
    return isNaN(num) ? undefined : num;
  }

  return undefined;
});

/* ----------------------------------------------------- */
/* Variant Attribute                                     */
/* ----------------------------------------------------- */

export const variantAttributeSchema = z.object({
  attributeId: z.number(),
  valueId: z.number(),
});

/* ----------------------------------------------------- */
/* Product Attribute                                     */
/* ----------------------------------------------------- */

export const productAttributeSchema = z.object({
  attributeId: z.number(),
  valueId: z.number(),
});

/* ----------------------------------------------------- */
/* Variant                                               */
/* ----------------------------------------------------- */

export const variantSchema = z
  .object({
    sku: z.string().optional(),

    barcode: z.string().optional(),

    purchasePrice: priceField.optional(),

    price: priceField.refine(
      (v) => v !== undefined && v > 0,
      "قیمت فروش الزامی است",
    ),

    discountPrice: priceField,

    stock: z.coerce.number().min(0, "موجودی نمی‌تواند منفی باشد"),

    expiryDate: z.string().optional(),

    images: z.any().array().optional(),

    attributes: z.array(variantAttributeSchema).default([]),
  })
  .refine(
    (data) =>
      data.discountPrice === undefined ||
      data.discountPrice < (data.price ?? 0),
    {
      message: "قیمت تخفیف باید کمتر از قیمت فروش باشد",
      path: ["discountPrice"],
    },
  );

/* ----------------------------------------------------- */
/* Product                                               */
/* ----------------------------------------------------- */

export const productSchema = z.object({
  name: z.string().min(1, "نام محصول الزامی است"),

  slug: z
    .string()
    .min(1, "Slug الزامی است")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug فقط باید شامل حروف انگلیسی، عدد و خط تیره باشد",
    ),

  description: z.string().default(""),

  shortDescription: z.string().max(500, "حداکثر ۵۰۰ کاراکتر").optional(),

  metaTitle: z.string().optional(),

  metaDescription: z.string().optional(),

  brandId: z.coerce.number(),

  categoryId: z.coerce.number(),

  isBlock: z.boolean().optional(),

  image: z.any().optional(),

  attributes: z
    .array(
      z.object({
        attributeId: z.number().optional(),
        valueId: z.number().optional(),
      }),
    )
    .default([]),

  variants: z
    .array(variantSchema)
    .min(1, "حداقل یک واریانت باید وجود داشته باشد"),
});

/* ----------------------------------------------------- */
/* Edit Product                                          */
/* ----------------------------------------------------- */

export const editProductSchema = z.object({
  name: z.string().min(1, "نام محصول الزامی است"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  slug: z
    .string()
    .min(1, "Slug الزامی است")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug فقط باید شامل حروف انگلیسی، عدد و خط تیره باشد",
    ),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  brandId: z.number({ invalid_type_error: "برند الزامی است" }),
  categoryId: z.number({ invalid_type_error: "دسته‌بندی الزامی است" }),
  isBlock: z.boolean().optional(),
  image: z.union([z.instanceof(File), z.string(), z.undefined()]).optional(),
  attributes: z
    .array(
      z.object({
        attributeId: z.number(),
        valueId: z.number(),
      }),
    )
    .optional(),
});

/* ----------------------------------------------------- */

export type CreateProductDTO = z.infer<typeof productSchema>;
export type EditProductDTO = z.infer<typeof editProductSchema>;
