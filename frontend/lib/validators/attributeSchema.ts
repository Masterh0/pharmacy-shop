import { z } from "zod";

export const attributeSchema = z.object({
  name: z
    .string()
    .min(2, "نام ویژگی الزامی است"),

  slug: z.string().optional(),

  variation: z.boolean(),

  filterable: z.boolean(),

  visible: z.boolean(),
});

export type CreateAttributeDTO = z.infer<
  typeof attributeSchema
>;

export const attributeValueSchema = z.object({
  value: z
    .string()
    .min(1, "مقدار ویژگی الزامی است"),
});

export type CreateAttributeValueDTO =
  z.infer<typeof attributeValueSchema>;