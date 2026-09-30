import { z } from "zod";

export const createAttributeSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().max(255).optional(),
  variation: z.boolean().optional(),
  filterable: z.boolean().optional(),
  visible: z.boolean().optional(),
});

export type CreateAttributeDTO = z.infer<typeof createAttributeSchema>;