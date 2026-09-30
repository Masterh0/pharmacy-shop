import { z } from "zod";
 
export const createAttributeValueSchema = z.object({
  value: z.string().min(1).max(255),
});
 
export type CreateAttributeValueDTO = z.infer<typeof createAttributeValueSchema>;
 