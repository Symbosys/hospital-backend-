import { z } from "zod";

/**
 * Roles allowed in the Clinical Intelligence Suite
 */
export const RoleEnum = z.enum(
  ["ADMIN", "DOCTOR", "NURSE", "STAFF", "LAB_TECHNICIAN", "PHARMACIST"],
  { message: "Unauthorized role assignment detected." }
);

/**
 * Validation for authentication (Login)
 */
export const loginSchema = z.object({
  personnelId: z
    .string()
    .min(1, "Identifier cannot be null")
    .trim(),
  password: z
    .string()
    .min(1, "Credential block cannot be null"),
});

/**
 * Validation for personnel initialization (Register)
 */
export const registerSchema = z.object({
  personnelId: z
    .string()
    .min(3, "Identifier must be at least 3 characters for uniqueness")
    .max(20, "Identifier exceeds institutional security limits")
    .trim(),
  password: z
    .string()
    .min(6, "Security Key must meet 6-character entropy minimum")
    .regex(/[A-Z]/, "Security Key must contain at least one uppercase character")
    .regex(/[0-9]/, "Security Key must contain at least one numerical digit")
    .regex(/[^A-Za-z0-9]/, "Security Key must contain at least one special character")
    .trim(),
  role: RoleEnum.default("STAFF"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
