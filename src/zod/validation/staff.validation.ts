import { z } from "zod";

export const medicalStaffSchema = z.object({
  staffId: z.string().min(1, "Staff ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().min(1, "Role is required"),
  department: z.string().min(1, "Department is required"),
  phone: z.string().min(7, "Phone number is invalid"),
  shift: z.enum(["Morning", "Evening", "Night"]),
  status: z.enum(["On Duty", "Off Duty", "On Leave"]).default("On Duty"),
});

export const updateMedicalStaffSchema = medicalStaffSchema.partial();

export const nonMedicalStaffSchema = z.object({
  staffId: z.string().min(1, "Staff ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  designation: z.string().min(1, "Designation is required"),
  department: z.string().min(1, "Department is required"),
  phone: z.string().min(7, "Phone number is invalid"),
  shift: z.enum(["Morning", "Evening", "Night"]),
  status: z.enum(["Active", "Inactive", "On Leave"]).default("Active"),
});

export const updateNonMedicalStaffSchema = nonMedicalStaffSchema.partial();
