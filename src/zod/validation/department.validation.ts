import { z } from "zod";

export const departmentSchema = z.object({
  name: z
    .string()
    .min(2, "Department name must be at least 2 characters")
    .trim(),
  head: z
    .string()
    .min(3, "Head name must be at least 3 characters")
    .trim(),
  staffCount: z
    .number()
    .int()
    .nonnegative()
    .default(0),
  occupancy: z
    .number()
    .int()
    .min(0, "Occupancy cannot be less than 0%")
    .max(100, "Occupancy cannot exceed 100%")
    .default(0),
  status: z.enum(["Available", "Optimal", "High Load", "Critical"], {
    message: "Invalid department status",
  }).default("Available"),
  color: z.enum(["rose", "blue", "indigo", "red", "emerald", "amber"], {
    message: "Invalid theme color selected",
  }).default("blue"),
});

export const updateDepartmentSchema = departmentSchema.partial();

export type DepartmentInput = z.infer<typeof departmentSchema>;
