import type { Request, Response } from "express";
import { prisma } from "../../../prisma.js";
import { otSchema, updateOTSchema } from "../../../zod/validation/ot.validation.js";
import { asyncHandler } from "../../../middleware/error.middleware.js";

/**
 * @desc    Fetch all surgical units (Operation Theatres)
 * @route   GET /api/ot
 */
export const getOTs = asyncHandler(async (req: Request, res: Response) => {
  try {
    const theatres = await prisma.operationTheatre.findMany({
      orderBy: { theatreId: "asc" }
    });

    return res.status(200).json({
      status: "success",
      data: theatres
    });
  } catch (error) {
    console.error("OT_FETCH_ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Surgical matrix node unreachable."
    });
  }
});

/**
 * @desc    Initialize a new surgical theatre node
 * @route   POST /api/ot
 */
export const createOT = asyncHandler(async (req: Request, res: Response) => {
  try {
    const validation = otSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: "error",
        message: "OT configuration validation failed.",
        errors: validation.error.flatten().fieldErrors
      });
    }

    // Strip undefined to satisfy exactOptionalPropertyTypes: true
    const otData = Object.fromEntries(
      Object.entries(validation.data).filter(([_, v]) => v !== undefined)
    );

    const theatre = await prisma.operationTheatre.create({
      data: otData as any
    });

    return res.status(201).json({
      status: "success",
      message: `Surgical node ${theatre.theatreId} initialized.`,
      data: theatre
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        status: "error",
        message: "Theatre identifier already in use."
      });
    }
    console.error("OT_CREATE_ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to initialize surgical node."
    });
  }
});

/**
 * @desc    Update theatre status or surgical progress
 * @route   PATCH /api/ot/:id
 */
export const updateOT = asyncHandler(async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const validation = updateOTSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        status: "error",
        errors: validation.error.flatten().fieldErrors
      });
    }

    // Surgical logic: If status moves to 'Ready' or 'Cleaning', clear active surgery metadata
    const data = { ...validation.data };
    if (data.status === "Ready" || data.status === "Cleaning") {
       data.doctor = null;
       data.patient = null;
       data.procedure = null;
       data.progress = 0;
    }

    // Strip undefined for exactOptionalPropertyTypes
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    const updatedOT = await prisma.operationTheatre.update({
      where: { id },
      data: updateData as any
    });

    return res.status(200).json({
      status: "success",
      message: "Surgical node telemetry updated.",
      data: updatedOT
    });
  } catch (error: any) {
    console.error("OT_UPDATE_ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal surgical system failure."
    });
  }
});

/**
 * @desc    Decommission surgical theatre node
 * @route   DELETE /api/ot/:id
 */
export const deleteOT = asyncHandler(async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const ot = await prisma.operationTheatre.findUnique({ where: { id } });
    if (ot?.status === 'Active Surgery') {
      return res.status(400).json({
        status: "error",
        message: "CRITICAL: Cannot decommission node during active surgery."
      });
    }

    await prisma.operationTheatre.delete({
      where: { id }
    });

    return res.status(200).json({
      status: "success",
      message: "Surgical node decommissioned."
    });
  } catch (error: any) {
    console.error("OT_DELETE_ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to decommission surgical node."
    });
  }
});
