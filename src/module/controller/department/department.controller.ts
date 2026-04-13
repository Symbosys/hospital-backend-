import type { Request, Response } from "express";
import { prisma } from "../../../prisma.js";
import { departmentSchema, updateDepartmentSchema } from "../../../zod/validation/department.validation.js";

/**
 * @desc    Fetch all department nodes
 * @route   GET /api/departments
 */
export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { wards: true }
        }
      },
      orderBy: { name: "asc" }
    });

    return res.status(200).json({
      status: "success",
      data: departments
    });
  } catch (error) {
    console.error("DEPT_FETCH_ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Analytics node unreachable."
    });
  }
};

/**
 * @desc    Initialize a new clinical department
 * @route   POST /api/departments
 */
export const createDepartment = async (req: Request, res: Response) => {
  try {
    const validation = departmentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: "error",
        message: "Configuration validation failed.",
        errors: validation.error.flatten().fieldErrors
      });
    }

    const department = await prisma.department.create({
      data: validation.data
    });

    return res.status(201).json({
      status: "success",
      message: "Department initialized successfully.",
      data: department
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        status: "error",
        message: "A department with this identifier already exists."
      });
    }
    console.error("DEPT_CREATE_ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to initialize department node."
    });
  }
};

/**
 * @desc    Update department telemetry/metadata
 * @route   PATCH /api/departments/:id
 */
export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const validation = updateDepartmentSchema.safeParse(req.body);

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

    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: updateData as any // Cast to any to handle exactOptionalPropertyTypes compatibility
    });

    return res.status(200).json({
      status: "success",
      message: "Department telemetry updated.",
      data: updatedDepartment
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
       return res.status(404).json({ status: "error", message: "Department node not found." });
    }
    console.error("DEPT_UPDATE_ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal reconfiguration failure."
    });
  }
};

/**
 * @desc    Terminate department node
 * @route   DELETE /api/departments/:id
 */
export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Check for existing dependencies (wards)
    const dept = await prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { wards: true } } }
    });

    if (dept && dept._count.wards > 0) {
       return res.status(400).json({
         status: "error",
         message: "Cannot terminate node while active sub-wards exist. Relocate or terminate wards first."
       });
    }

    await prisma.department.delete({
      where: { id }
    });

    return res.status(200).json({
      status: "success",
      message: "Department node successfully decommissioned."
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
       return res.status(404).json({ status: "error", message: "Department node not found." });
    }
    console.error("DEPT_DELETE_ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to decommission clinical node."
    });
  }
};
