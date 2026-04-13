import { z } from "zod";

export const labSchema = z.object({
  testId: z
    .string()
    .min(1, "Test Identifier (e.g., LAB-X1) is required")
    .regex(/^LAB-[A-Z0-9]+$/, "Identifier must follow format LAB-XXXX")
    .trim(),
  name: z
    .string()
    .min(2, "Test name is required")
    .trim(),
  type: z
    .enum(["Hematology", "Biochemistry", "Radiology", "Microbiology", "Pathology", "Immunology"], {
      message: "Invalid test type.",
    }),
  time: z
    .string()
    .min(1, "Turnaround time is required")
    .trim(),
  status: z
    .enum(["Critical Priority", "Urgent", "Routine", "Scheduled"], {
      message: "Invalid status priority.",
    }),
  price: z
    .string()
    .regex(/^₹?\d+$/, "Price must be a numeric string, optionally starting with ₹")
    .trim(),
});

export const updateLabSchema = labSchema.partial();

export type LabInput = z.infer<typeof labSchema>;
