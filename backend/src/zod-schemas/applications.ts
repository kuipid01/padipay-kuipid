import { z } from "zod";

export const UpdateApplicationSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export type UpdateApplicationInput = z.infer<typeof UpdateApplicationSchema>;
