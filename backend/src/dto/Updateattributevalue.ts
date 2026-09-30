import { z } from "zod";

export const updateAttributeValueSchema = z.object({
  value: z.string().min(1).max(255),
});

export type UpdateAttributeValueDTO = z.infer<typeof updateAttributeValueSchema>;