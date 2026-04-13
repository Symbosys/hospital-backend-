import type { Request, Response } from "express";
import { prisma } from "../../../prisma.js";
import { labSchema, updateLabSchema } from "../../../zod/validation/lab.validation.js";

/**
 * @desc    Fetch all laboratory tests
 * @route   GET /api/lab
 */
export const getLabTests = async (req: Request, res: Response) => {
  try {
    const tests = await prisma.laboratoryTest.findMany({
      orderBy: { testId: "asc" }
    });

    return res.status(200).json({
      status: "success",
      data: tests
    });
  } catch (error) {
    console.error("LAB_FETCH_ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Laboratory diagnostic node unreachable."
    });
  }
};

/**
 * @desc    Fetch single lab test by ID
 * @route   GET /api/lab/:id
 */
export const getLabTestById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const test = await prisma.laboratoryTest.findUnique({
      where: { id }
    });

    if (!test) {
      return res.status(404).json({
        status: "error",
        message: "Laboratory test not found."
      });
    }

    return res.status(200).json({
      status: "success",
      data: test
    });
  } catch (error) {
    console.error("LAB_GET_BY_ID_ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal diagnostic system failure."
    });
  }
}

/**
 * @desc    Initialize a new laboratory test record
 * @route   POST /api/lab
 */
export const createLabTest = async (req: Request, res: Response) => {
  try {
    const validation = labSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: "error",
        message: "Lab test configuration validation failed.",
        errors: validation.error.flatten().fieldErrors
      });
    }

    // Strip undefined to satisfy exactOptionalPropertyTypes: true
    const labData = Object.fromEntries(
      Object.entries(validation.data).filter(([_, v]) => v !== undefined)
    );

    const test = await prisma.laboratoryTest.create({
      data: labData as any
    });

    return res.status(201).json({
      status: "success",
      message: `Laboratory test ${test.testId} initialized.`,
      data: test
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        status: "error",
        message: "Test identifier already in use."
      });
    }
    console.error("LAB_CREATE_ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to initialize laboratory node."
    });
  }
};

/**
 * @desc    Update lab test details or status
 * @route   PATCH /api/lab/:id
 */
export const updateLabTest = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const validation = updateLabSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        status: "error",
        errors: validation.error.flatten().fieldErrors
      });
    }

    // Strip undefined for exactOptionalPropertyTypes
    const updateData = Object.fromEntries(
      Object.entries(validation.data).filter(([_, v]) => v !== undefined)
    );

    const updatedTest = await prisma.laboratoryTest.update({
      where: { id },
      data: updateData as any
    });

    return res.status(200).json({
      status: "success",
      message: "Laboratory diagnostic telemetry updated.",
      data: updatedTest
    });
  } catch (error: any) {
    console.error("LAB_UPDATE_ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal laboratory system failure."
    });
  }
};

/**
 * @desc    Decommission laboratory test record
 * @route   DELETE /api/lab/:id
 */
export const deleteLabTest = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const test = await prisma.laboratoryTest.findUnique({ where: { id } });
    if (!test) {
      return res.status(404).json({
        status: "error",
        message: "Laboratory test not found."
      });
    }

    await prisma.laboratoryTest.delete({
      where: { id }
    });

    return res.status(200).json({
      status: "success",
      message: "Laboratory test decommissioned."
    });
  } catch (error: any) {
    console.error("LAB_DELETE_ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to decommission diagnostic node."
    });
  }
};
