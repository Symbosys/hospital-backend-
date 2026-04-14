import type { Request, Response } from "express";
import { prisma } from "../../../prisma.js";
import { wardSchema, updateWardSchema } from "../../../zod/validation/ward.validation.js";
import { asyncHandler } from "../../../middleware/error.middleware.js";

/**
 * @desc    Fetch all clinical wards matrix
 * @route   GET /api/wards
 */
export const getWards = asyncHandler(async (req: Request, res: Response) => {
  try {
    const wards = await prisma.ward.findMany({
      include: {
        department: { select: { name: true } },
        beds: true,
        _count: { select: { beds: true } },
      },
    });

    return res.status(200).json({
      status: "success",
      data: wards,
    });
  } catch (error) {
    console.error("WARD_FETCH_ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Ward topology unreachable.",
    });
  }
});

/**
 * @desc    Initialize a new ward node and its bed matrix
 * @route   POST /api/wards
 */
export const createWard = asyncHandler(async (req: Request, res: Response) => {
  try {
    const validation = wardSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: "error",
        message: "Ward configuration invalid.",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { name, departmentId, totalBeds, color } = validation.data;

    // Transactional creation of ward and its initial bed matrix
    const newWard = await prisma.$transaction(async (tx) => {
      const ward = await tx.ward.create({
        data: { name, departmentId, totalBeds, color },
      });

      // Automatically generate bed units based on totalBeds count
      const bedData = Array.from({ length: totalBeds }).map((_, i) => ({
        bedNumber: `B-${i + 1}`,
        wardId: ward.id,
        status: "Available",
      }));

      await tx.bed.createMany({
        data: bedData,
      });

      return ward;
    });

    return res.status(201).json({
      status: "success",
      message: `Ward ${name} initialized with ${totalBeds} bed units.`,
      data: newWard,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({
        status: "error",
        message: "Ward identifier already exists in central infrastructure.",
      });
    }
    console.error("WARD_CREATE_ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to initialize ward and bed matrix.",
    });
  }
});

/**
 * @desc    Update ward telemetry/hierarchy
 * @route   PATCH /api/wards/:id
 */
export const updateWard = asyncHandler(async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const validation = updateWardSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        status: "error",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    // Strip undefined properties to satisfy exactOptionalPropertyTypes: true
    const updateData = Object.fromEntries(
      Object.entries(validation.data).filter(([_, v]) => v !== undefined)
    );

    const updatedWard = await prisma.ward.update({
      where: { id },
      data: updateData as any,
    });

    return res.status(200).json({
      status: "success",
      message: "Ward configuration updated.",
      data: updatedWard,
    });
  } catch (error: any) {
    console.error("WARD_UPDATE_ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal reconfiguration failure.",
    });
  }
});

/**
 * @desc    Decommission ward node (only if all beds are empty)
 * @route   DELETE /api/wards/:id
 */
export const deleteWard = asyncHandler(async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Check for occupied units
    const occupiedUnits = await prisma.bed.count({
      where: { 
        wardId: id,
        status: "Occupied"
      }
    });

    if (occupiedUnits > 0) {
      return res.status(400).json({
        status: "error",
        message: `Cannot decommission ward: ${occupiedUnits} units are currently occupied by patients.`,
      });
    }

    // Transactional deletion of ward and its beds
    await prisma.$transaction(async (tx) => {
      await tx.bed.deleteMany({ where: { wardId: id } });
      await tx.ward.delete({ where: { id } });
    });

    return res.status(200).json({
      status: "success",
      message: "Ward node and its associated bed matrix decommissioned.",
    });
  } catch (error: any) {
    console.error("WARD_DELETE_ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to decommission ward node.",
    });
  }
});
