import type { Request, Response } from "express";
import { prisma } from "../../../prisma.js";
import { bedSchema, updateBedSchema } from "../../../zod/validation/bed.validation.js";

/**
 * @desc    Fetch all unit telemetry (Beds)
 * @route   GET /api/beds
 */
export const getBeds = async (req: Request, res: Response) => {
  try {
    const { wardId } = req.query;
    
    const beds = await prisma.bed.findMany({
      where: wardId ? { wardId: String(wardId) } : {},
      include: {
        ward: {
          select: { name: true, department: { select: { name: true } } }
        }
      },
      orderBy: { bedNumber: "asc" }
    });

    return res.status(200).json({
      status: "success",
      data: beds
    });
  } catch (error) {
    console.error("BED_FETCH_ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Unit telemetry unreachable."
    });
  }
};

/**
 * @desc    Initialize a new clinical bed unit
 * @route   POST /api/beds
 */
export const createBed = async (req: Request, res: Response) => {
  try {
    const validation = bedSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: "error",
        message: "Bed configuration invalid.",
        errors: validation.error.flatten().fieldErrors
      });
    }

    // Strip undefined properties to satisfy exactOptionalPropertyTypes: true
    const bedData = Object.fromEntries(
      Object.entries(validation.data).filter(([_, v]) => v !== undefined)
    );

    const bed = await prisma.bed.create({
      data: bedData as any
    });

    return res.status(201).json({
      status: "success",
      message: "Clinical bed unit initialized.",
      data: bed
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        status: "error",
        message: "Bed number already exists in this ward."
      });
    }
    console.error("BED_CREATE_ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to initialize bed unit."
    });
  }
};

/**
 * @desc    Update bed status or patient assignment
 * @route   PATCH /api/beds/:id
 */
export const updateBed = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const validation = updateBedSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        status: "error",
        errors: validation.error.flatten().fieldErrors
      });
    }

    // Strip undefined properties to satisfy exactOptionalPropertyTypes: true
    const updateData = Object.fromEntries(
      Object.entries(validation.data).filter(([_, v]) => v !== undefined)
    );

    const updatedBed = await prisma.bed.update({
      where: { id },
      data: updateData as any
    });

    return res.status(200).json({
      status: "success",
      message: "Unit telemetry updated.",
      data: updatedBed
    });
  } catch (error: any) {
    console.error("BED_UPDATE_ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal unit reconfiguration failure."
    });
  }
};

/**
 * @desc    Decommission bed unit
 * @route   DELETE /api/beds/:id
 */
export const deleteBed = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const bed = await prisma.bed.findUnique({ where: { id } });
    if (bed?.status === 'Occupied') {
      return res.status(400).json({
        status: "error",
        message: "Cannot decommission unit while occupied by patient."
      });
    }

    await prisma.bed.delete({
      where: { id }
    });

    return res.status(200).json({
      status: "success",
      message: "Clinical bed unit decommissioned."
    });
  } catch (error: any) {
    console.error("BED_DELETE_ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to decommission unit."
    });
  }
};
