import { z } from "zod";

export const ehrSchema = z.object({
  ehrId: z.string().min(1, "EHR ID is required"),
  patientId: z.string().min(1, "Patient ID is required"),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  prescription: z.string().optional(),
  notes: z.string().optional(),
  vitals: z.string().optional(), // JSON string
  doctorName: z.string().min(2, "Doctor name is required"),
  visitDate: z.string().datetime("Invalid date format"),
});

export const updateEhrSchema = ehrSchema.partial();
