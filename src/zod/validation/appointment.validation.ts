import { z } from "zod";

export const appointmentSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
  patientId: z.string().min(1, "Patient ID is required"),
  doctorId: z.string().min(1, "Doctor ID is required"),
  date: z.string().datetime("Invalid date format"),
  timeSlot: z.string().min(1, "Time slot is required"),
  type: z.enum(["Consultation", "Follow-up", "Emergency", "Procedure"]),
  status: z.enum(["Scheduled", "Completed", "Cancelled", "No-Show"]).default("Scheduled"),
  notes: z.string().optional(),
});

export const updateAppointmentSchema = appointmentSchema.partial();
