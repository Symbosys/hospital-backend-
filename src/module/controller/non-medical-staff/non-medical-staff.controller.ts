import type { Request, Response } from "express";
import { prisma } from "../../../prisma.js";
import { nonMedicalStaffSchema, updateNonMedicalStaffSchema } from "../../../zod/validation/staff.validation.js";

/**
 * @desc    Fetch all non-medical staff
 * @route   GET /api/non-medical-staff
 */
export const getNonMedicalStaff = async (req: Request, res: Response) => {
  try {
    const status = req.query["status"] as string | undefined;
    const shift = req.query["shift"] as string | undefined;
    const department = req.query["department"] as string | undefined;

    const where: Record<string, unknown> = {};
    if (status) where["status"] = status;
    if (shift) where["shift"] = shift;
    if (department) where["department"] = { contains: department, mode: "insensitive" };

    const staff = await prisma.nonMedicalStaff.findMany({ where, orderBy: { name: "asc" } });
    return res.status(200).json({ status: "success", data: staff });
  } catch (error) {
    console.error("NON_MEDICAL_STAFF_FETCH_ERROR:", error);
    return res.status(500).json({ status: "error", message: "Non-medical staff registry unreachable." });
  }
};

/**
 * @desc    Get a single non-medical staff member
 * @route   GET /api/non-medical-staff/:id
 */
export const getNonMedicalStaffById = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const staff = await prisma.nonMedicalStaff.findUnique({ where: { id } });
    if (!staff) return res.status(404).json({ status: "error", message: "Staff record not found." });
    return res.status(200).json({ status: "success", data: staff });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Internal server error." });
  }
};

/**
 * @desc    Create a non-medical staff record
 * @route   POST /api/non-medical-staff
 */
export const createNonMedicalStaff = async (req: Request, res: Response) => {
  try {
    const validation = nonMedicalStaffSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ status: "error", message: "Validation failed.", errors: validation.error.flatten().fieldErrors });
    }
    const data = validation.data;
    const staff = await prisma.nonMedicalStaff.create({
      data: {
        staffId: data.staffId,
        name: data.name,
        designation: data.designation,
        department: data.department,
        phone: data.phone,
        shift: data.shift,
        status: data.status ?? "Active",
      },
    });
    return res.status(201).json({ status: "success", message: "Non-medical staff record created.", data: staff });
  } catch (error: any) {
    if (error.code === "P2002") return res.status(409).json({ status: "error", message: "Staff ID already exists." });
    console.error("NON_MEDICAL_STAFF_CREATE_ERROR:", error);
    return res.status(500).json({ status: "error", message: "Failed to create staff record." });
  }
};

/**
 * @desc    Update a non-medical staff record
 * @route   PATCH /api/non-medical-staff/:id
 */
export const updateNonMedicalStaff = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const validation = updateNonMedicalStaffSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ status: "error", errors: validation.error.flatten().fieldErrors });
    }
    const data = validation.data;
    const updateData: Record<string, unknown> = {};
    if (data.staffId !== undefined) updateData["staffId"] = data.staffId;
    if (data.name !== undefined) updateData["name"] = data.name;
    if (data.designation !== undefined) updateData["designation"] = data.designation;
    if (data.department !== undefined) updateData["department"] = data.department;
    if (data.phone !== undefined) updateData["phone"] = data.phone;
    if (data.shift !== undefined) updateData["shift"] = data.shift;
    if (data.status !== undefined) updateData["status"] = data.status;

    const staff = await prisma.nonMedicalStaff.update({ where: { id }, data: updateData });
    return res.status(200).json({ status: "success", message: "Staff record updated.", data: staff });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ status: "error", message: "Staff not found." });
    return res.status(500).json({ status: "error", message: "Update failed." });
  }
};

/**
 * @desc    Delete a non-medical staff record
 * @route   DELETE /api/non-medical-staff/:id
 */
export const deleteNonMedicalStaff = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    await prisma.nonMedicalStaff.delete({ where: { id } });
    return res.status(200).json({ status: "success", message: "Staff record decommissioned." });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ status: "error", message: "Staff not found." });
    return res.status(500).json({ status: "error", message: "Failed to delete staff record." });
  }
};
