import { z } from "zod";

export const updateAttributeSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().max(255).optional(),
  variation: z.boolean().optional(),
  filterable: z.boolean().optional(),
  visible: z.boolean().optional(),
});

export type UpdateAttributeDTO = z.infer<typeof updateAttributeSchema>;