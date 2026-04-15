import { z } from "zod";

export const doctorSchema = z.object({
  doctorId: z.string().min(1, "Doctor ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  specialty: z.string().min(1, "Specialty is required"),
  departmentId: z.string().optional(),
  phone: z.string().min(7, "Phone number is invalid"),
  email: z.string().email("Invalid email").optional(),
  experience: z.number().int().min(0).default(0),
  status: z.enum(["On Duty", "Off Duty", "On Leave"]).default("On Duty"),
  schedule: z.string().optional(),
});

export const updateDoctorSchema = doctorSchema.partial();
