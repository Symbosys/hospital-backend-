import { z } from "zod";

export const bedSchema = z.object({
  bedNumber: z
    .string()
    .min(1, "Bed number is mandatory")
    .trim(),
  wardId: z
    .string()
    .uuid("Invalid Ward reference ID"),
  status: z
    .enum(["Occupied", "Available", "Cleaning"])
    .default("Available"),
  patientId: z
    .string()
    .optional()
    .nullable(),
});

export const updateBedSchema = bedSchema.partial();

export type BedInput = z.infer<typeof bedSchema>;
