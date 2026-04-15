import type { Request, Response } from "express";
import { prisma } from "../../../prisma.js";
import { patientSchema, updatePatientSchema } from "../../../zod/validation/patient.validation.js";

/**
 * @desc    Fetch all patient records
 * @route   GET /api/patients
 */
export const getPatients = async (req: Request, res: Response) => {
  try {
    const status = req.query["status"] as string | undefined;
    const ward = req.query["ward"] as string | undefined;

    const where: Record<string, unknown> = {};
    if (status) where["status"] = status;
    if (ward) where["ward"] = { contains: ward, mode: "insensitive" };

    const patients = await prisma.patient.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ status: "success", data: patients });
  } catch (error) {
    console.error("PATIENT_FETCH_ERROR:", error);
    return res.status(500).json({ status: "error", message: "Patient registry unreachable." });
  }
};

/**
 * @desc    Get a single patient by ID
 * @route   GET /api/patients/:id
 */
export const getPatientById = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: { appointments: true, ehrRecords: true, billingRecords: true },
    });

    if (!patient) {
      return res.status(404).json({ status: "error", message: "Patient record not found." });
    }

    return res.status(200).json({ status: "success", data: patient });
  } catch (error) {
    console.error("PATIENT_GET_ERROR:", error);
    return res.status(500).json({ status: "error", message: "Internal server error." });
  }
};

/**
 * @desc    Register a new patient
 * @route   POST /api/patients
 */
export const createPatient = async (req: Request, res: Response) => {
  try {
    const validation = patientSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: "error",
        message: "Patient data validation failed.",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const data = validation.data;
    const patient = await prisma.patient.create({
      data: {
        patientId: data.patientId,
        name: data.name,
        age: data.age,
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        phone: data.phone,
        address: data.address ?? null,
        condition: data.condition,
        ward: data.ward ?? null,
        admittedOn: data.admittedOn ? new Date(data.admittedOn) : null,
        dischargedOn: data.dischargedOn ? new Date(data.dischargedOn) : null,
        status: data.status ?? "Inpatient",
      },
    });

    return res.status(201).json({ status: "success", message: "Patient registered.", data: patient });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ status: "error", message: "Patient ID already exists." });
    }
    console.error("PATIENT_CREATE_ERROR:", error);
    return res.status(500).json({ status: "error", message: "Failed to register patient." });
  }
};

/**
 * @desc    Update patient record
 * @route   PATCH /api/patients/:id
 */
export const updatePatient = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const validation = updatePatientSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ status: "error", errors: validation.error.flatten().fieldErrors });
    }

    const data = validation.data;
    const updateData: Record<string, unknown> = {};
    if (data.patientId !== undefined) updateData["patientId"] = data.patientId;
    if (data.name !== undefined) updateData["name"] = data.name;
    if (data.age !== undefined) updateData["age"] = data.age;
    if (data.gender !== undefined) updateData["gender"] = data.gender;
    if (data.bloodGroup !== undefined) updateData["bloodGroup"] = data.bloodGroup;
    if (data.phone !== undefined) updateData["phone"] = data.phone;
    if (data.address !== undefined) updateData["address"] = data.address ?? null;
    if (data.condition !== undefined) updateData["condition"] = data.condition;
    if (data.ward !== undefined) updateData["ward"] = data.ward ?? null;
    if (data.status !== undefined) updateData["status"] = data.status;
    if (data.admittedOn !== undefined) updateData["admittedOn"] = new Date(data.admittedOn);
    if (data.dischargedOn !== undefined) updateData["dischargedOn"] = new Date(data.dischargedOn);

    const patient = await prisma.patient.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({ status: "success", message: "Patient record updated.", data: patient });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ status: "error", message: "Patient not found." });
    console.error("PATIENT_UPDATE_ERROR:", error);
    return res.status(500).json({ status: "error", message: "Update failed." });
  }
};

/**
 * @desc    Discharge / delete a patient record
 * @route   DELETE /api/patients/:id
 */
export const deletePatient = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    await prisma.patient.delete({ where: { id } });
    return res.status(200).json({ status: "success", message: "Patient record decommissioned." });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ status: "error", message: "Patient not found." });
    console.error("PATIENT_DELETE_ERROR:", error);
    return res.status(500).json({ status: "error", message: "Failed to delete patient." });
  }
};
