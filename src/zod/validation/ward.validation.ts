import { z } from "zod";

export const wardSchema = z.object({
  name: z
    .string()
    .min(2, "Ward identifier must be at least 2 characters")
    .trim(),
  departmentId: z
    .string()
    .uuid("Invalid Department reference ID"),
  totalBeds: z
    .number()
    .int()
    .positive("Total capacity must be at least 1 unit")
    .default(10),
  color: z
    .enum(["rose", "blue", "amber", "emerald", "indigo", "slate"])
    .default("blue"),
});

export const updateWardSchema = wardSchema.partial();

export type WardInput = z.infer<typeof wardSchema>;
