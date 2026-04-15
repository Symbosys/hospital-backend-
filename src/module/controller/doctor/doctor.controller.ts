import type { Request, Response } from "express";
import { prisma } from "../../../prisma.js";
import { doctorSchema, updateDoctorSchema } from "../../../zod/validation/doctor.validation.js";

/**
 * @desc    Fetch all doctors
 * @route   GET /api/doctors
 */
export const getDoctors = async (req: Request, res: Response) => {
  try {
    const status = req.query["status"] as string | undefined;
    const specialty = req.query["specialty"] as string | undefined;

    const where: Record<string, unknown> = {};
    if (status) where["status"] = status;
    if (specialty) where["specialty"] = { contains: specialty, mode: "insensitive" };

    const doctors = await prisma.doctor.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return res.status(200).json({ status: "success", data: doctors });
  } catch (error) {
    console.error("DOCTOR_FETCH_ERROR:", error);
    return res.status(500).json({ status: "error", message: "Doctor registry unreachable." });
  }
};

/**
 * @desc    Get a single doctor by ID
 * @route   GET /api/doctors/:id
 */
export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: { appointments: true },
    });

    if (!doctor) return res.status(404).json({ status: "error", message: "Doctor record not found." });
    return res.status(200).json({ status: "success", data: doctor });
  } catch (error) {
    console.error("DOCTOR_GET_ERROR:", error);
    return res.status(500).json({ status: "error", message: "Internal server error." });
  }
};

/**
 * @desc    Register a new doctor
 * @route   POST /api/doctors
 */
export const createDoctor = async (req: Request, res: Response) => {
  try {
    const validation = doctorSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: "error",
        message: "Doctor data validation failed.",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const data = validation.data;
    const doctor = await prisma.doctor.create({
      data: {
        doctorId: data.doctorId,
        name: data.name,
        specialty: data.specialty,
        departmentId: data.departmentId ?? null,
        phone: data.phone,
        email: data.email ?? null,
        experience: data.experience ?? 0,
        status: data.status ?? "On Duty",
        schedule: data.schedule ?? null,
      },
    });
    return res.status(201).json({ status: "success", message: "Doctor registered.", data: doctor });
  } catch (error: any) {
    if (error.code === "P2002") return res.status(409).json({ status: "error", message: "Doctor ID or email already exists." });
    console.error("DOCTOR_CREATE_ERROR:", error);
    return res.status(500).json({ status: "error", message: "Failed to register doctor." });
  }
};

/**
 * @desc    Update doctor record
 * @route   PATCH /api/doctors/:id
 */
export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const validation = updateDoctorSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ status: "error", errors: validation.error.flatten().fieldErrors });
    }

    const data = validation.data;
    const updateData: Record<string, unknown> = {};
    if (data.doctorId !== undefined) updateData["doctorId"] = data.doctorId;
    if (data.name !== undefined) updateData["name"] = data.name;
    if (data.specialty !== undefined) updateData["specialty"] = data.specialty;
    if (data.departmentId !== undefined) updateData["departmentId"] = data.departmentId ?? null;
    if (data.phone !== undefined) updateData["phone"] = data.phone;
    if (data.email !== undefined) updateData["email"] = data.email ?? null;
    if (data.experience !== undefined) updateData["experience"] = data.experience;
    if (data.status !== undefined) updateData["status"] = data.status;
    if (data.schedule !== undefined) updateData["schedule"] = data.schedule ?? null;

    const doctor = await prisma.doctor.update({ where: { id }, data: updateData });
    return res.status(200).json({ status: "success", message: "Doctor record updated.", data: doctor });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ status: "error", message: "Doctor not found." });
    console.error("DOCTOR_UPDATE_ERROR:", error);
    return res.status(500).json({ status: "error", message: "Update failed." });
  }
};

/**
 * @desc    Delete a doctor record
 * @route   DELETE /api/doctors/:id
 */
export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    await prisma.doctor.delete({ where: { id } });
    return res.status(200).json({ status: "success", message: "Doctor record decommissioned." });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ status: "error", message: "Doctor not found." });
    console.error("DOCTOR_DELETE_ERROR:", error);
    return res.status(500).json({ status: "error", message: "Failed to delete doctor." });
  }
};
