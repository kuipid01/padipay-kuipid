import { z } from "zod";

export const addDocumentSchema = z.object({
  name: z.string().min(1),
  type: z.enum([
    "GOVERNMENT_ID",
    "PROOF_OF_ADDRESS",
    "BANK_STATEMENT",
    "UTILITY_BILL",
    "EMPLOYMENT_LETTER",
    "OTHER",
  ]),
  file: z.any().optional(), // File instance for multipart
  url: z.string().url().optional(), // For manual entry if needed
  metadata: z.any().optional(),
});


export type AddDocumentInput = z.infer<typeof addDocumentSchema>;
