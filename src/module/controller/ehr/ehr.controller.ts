import type { Request, Response } from "express";
import { prisma } from "../../../prisma.js";
import { ehrSchema, updateEhrSchema } from "../../../zod/validation/ehr.validation.js";

/**
 * @desc    Fetch all EHR records
 * @route   GET /api/ehr
 */
export const getEhrRecords = async (req: Request, res: Response) => {
  try {
    const patientId = req.query["patientId"] as string | undefined;
    const where: Record<string, unknown> = {};
    if (patientId) where["patientId"] = patientId;

    const records = await prisma.eHRRecord.findMany({
      where,
      include: { patient: { select: { name: true, patientId: true } } },
      orderBy: { visitDate: "desc" },
    });

    return res.status(200).json({ status: "success", data: records });
  } catch (error) {
    console.error("EHR_FETCH_ERROR:", error);
    return res.status(500).json({ status: "error", message: "EHR registry unreachable." });
  }
};

/**
 * @desc    Get a single EHR record
 * @route   GET /api/ehr/:id
 */
export const getEhrById = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const record = await prisma.eHRRecord.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!record) return res.status(404).json({ status: "error", message: "EHR record not found." });
    return res.status(200).json({ status: "success", data: record });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Internal server error." });
  }
};

/**
 * @desc    Create a new EHR record
 * @route   POST /api/ehr
 */
export const createEhrRecord = async (req: Request, res: Response) => {
  try {
    const validation = ehrSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ status: "error", message: "Validation failed.", errors: validation.error.flatten().fieldErrors });
    }

    const data = validation.data;
    const record = await prisma.eHRRecord.create({
      data: {
        ehrId: data.ehrId,
        patientId: data.patientId,
        diagnosis: data.diagnosis,
        prescription: data.prescription ?? null,
        notes: data.notes ?? null,
        vitals: data.vitals ?? null,
        doctorName: data.doctorName,
        visitDate: new Date(data.visitDate),
      },
    });

    return res.status(201).json({ status: "success", message: "EHR record created.", data: record });
  } catch (error: any) {
    if (error.code === "P2002") return res.status(409).json({ status: "error", message: "EHR ID already exists." });
    if (error.code === "P2003") return res.status(404).json({ status: "error", message: "Referenced patient not found." });
    console.error("EHR_CREATE_ERROR:", error);
    return res.status(500).json({ status: "error", message: "Failed to create EHR record." });
  }
};

/**
 * @desc    Update an EHR record
 * @route   PATCH /api/ehr/:id
 */
export const updateEhrRecord = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const validation = updateEhrSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ status: "error", errors: validation.error.flatten().fieldErrors });
    }

    const data = validation.data;
    const updateData: Record<string, unknown> = {};
    if (data.ehrId !== undefined) updateData["ehrId"] = data.ehrId;
    if (data.patientId !== undefined) updateData["patientId"] = data.patientId;
    if (data.diagnosis !== undefined) updateData["diagnosis"] = data.diagnosis;
    if (data.prescription !== undefined) updateData["prescription"] = data.prescription ?? null;
    if (data.notes !== undefined) updateData["notes"] = data.notes ?? null;
    if (data.vitals !== undefined) updateData["vitals"] = data.vitals ?? null;
    if (data.doctorName !== undefined) updateData["doctorName"] = data.doctorName;
    if (data.visitDate !== undefined) updateData["visitDate"] = new Date(data.visitDate);

    const record = await prisma.eHRRecord.update({ where: { id }, data: updateData });
    return res.status(200).json({ status: "success", message: "EHR record updated.", data: record });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ status: "error", message: "EHR record not found." });
    return res.status(500).json({ status: "error", message: "Update failed." });
  }
};

/**
 * @desc    Delete an EHR record
 * @route   DELETE /api/ehr/:id
 */
export const deleteEhrRecord = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    await prisma.eHRRecord.delete({ where: { id } });
    return res.status(200).json({ status: "success", message: "EHR record deleted." });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ status: "error", message: "EHR record not found." });
    return res.status(500).json({ status: "error", message: "Failed to delete EHR record." });
  }
};
