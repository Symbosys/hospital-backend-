import { z } from "zod";

export const patientSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().int().min(0).max(150),
  gender: z.enum(["Male", "Female", "Other"]),
  bloodGroup: z.string().min(1, "Blood group is required"),
  phone: z.string().min(7, "Phone number is invalid"),
  address: z.string().optional(),
  condition: z.string().min(1, "Condition is required"),
  ward: z.string().optional(),
  admittedOn: z.string().datetime().optional(),
  dischargedOn: z.string().datetime().optional(),
  status: z.enum(["Inpatient", "Outpatient", "Discharged"]).default("Inpatient"),
});

export const updatePatientSchema = patientSchema.partial();
