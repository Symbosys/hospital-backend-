import { z } from "zod";

export const billingSchema = z.object({
  billId: z.string().min(1, "Bill ID is required"),
  patientId: z.string().min(1, "Patient ID is required"),
  amount: z.number().positive("Amount must be positive"),
  paidAmount: z.number().min(0).default(0),
  category: z.enum(["Consultation", "Surgery", "Lab", "Pharmacy", "Room"]),
  status: z.enum(["Pending", "Paid", "Partial", "Waived"]).default("Pending"),
  paymentMode: z.enum(["Cash", "Card", "Insurance", "UPI"]).optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateBillingSchema = billingSchema.partial();
