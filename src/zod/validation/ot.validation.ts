import { z } from "zod";

export const otSchema = z.object({
  theatreId: z
    .string()
    .min(1, "Theatre Identifier (e.g., OT-01) is required")
    .trim(),
  status: z
    .enum(["Active Surgery", "Ready", "Cleaning"])
    .default("Ready"),
  doctor: z
    .string()
    .nullable()
    .optional(),
  patient: z
    .string()
    .nullable()
    .optional(),
  procedure: z
    .string()
    .nullable()
    .optional(),
  progress: z
    .number()
    .int()
    .min(0)
    .max(100)
    .default(0),
  equipment: z
    .enum(["Excellent", "Ready", "Observation"])
    .default("Ready"),
});

export const updateOTSchema = otSchema.partial();

export type OTInput = z.infer<typeof otSchema>;
