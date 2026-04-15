import type { Request, Response } from "express";
import { prisma } from "../../../prisma.js";
import { appointmentSchema, updateAppointmentSchema } from "../../../zod/validation/appointment.validation.js";

/**
 * @desc    Fetch all appointments
 * @route   GET /api/appointments
 */
export const getAppointments = async (req: Request, res: Response) => {
  try {
    const status = req.query["status"] as string | undefined;
    const type = req.query["type"] as string | undefined;
    const doctorId = req.query["doctorId"] as string | undefined;
    const patientId = req.query["patientId"] as string | undefined;

    const where: Record<string, unknown> = {};
    if (status) where["status"] = status;
    if (type) where["type"] = type;
    if (doctorId) where["doctorId"] = doctorId;
    if (patientId) where["patientId"] = patientId;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { name: true, patientId: true } },
        doctor: { select: { name: true, specialty: true } },
      },
      orderBy: { date: "asc" },
    });

    return res.status(200).json({ status: "success", data: appointments });
  } catch (error) {
    console.error("APPOINTMENT_FETCH_ERROR:", error);
    return res.status(500).json({ status: "error", message: "Appointment registry unreachable." });
  }
};

/**
 * @desc    Get a single appointment
 * @route   GET /api/appointments/:id
 */
export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const appt = await prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, doctor: true },
    });

    if (!appt) return res.status(404).json({ status: "error", message: "Appointment not found." });
    return res.status(200).json({ status: "success", data: appt });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Internal server error." });
  }
};

/**
 * @desc    Schedule a new appointment
 * @route   POST /api/appointments
 */
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const validation = appointmentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ status: "error", message: "Validation failed.", errors: validation.error.flatten().fieldErrors });
    }

    const data = validation.data;
    const appt = await prisma.appointment.create({
      data: {
        appointmentId: data.appointmentId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        date: new Date(data.date),
        timeSlot: data.timeSlot,
        type: data.type,
        status: data.status ?? "Scheduled",
        notes: data.notes ?? null,
      },
    });

    return res.status(201).json({ status: "success", message: "Appointment scheduled.", data: appt });
  } catch (error: any) {
    if (error.code === "P2002") return res.status(409).json({ status: "error", message: "Appointment ID already exists." });
    if (error.code === "P2003") return res.status(404).json({ status: "error", message: "Referenced patient or doctor not found." });
    console.error("APPOINTMENT_CREATE_ERROR:", error);
    return res.status(500).json({ status: "error", message: "Failed to schedule appointment." });
  }
};

/**
 * @desc    Update appointment status or details
 * @route   PATCH /api/appointments/:id
 */
export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const validation = updateAppointmentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ status: "error", errors: validation.error.flatten().fieldErrors });
    }

    const data = validation.data;
    const updateData: Record<string, unknown> = {};
    if (data.appointmentId !== undefined) updateData["appointmentId"] = data.appointmentId;
    if (data.patientId !== undefined) updateData["patientId"] = data.patientId;
    if (data.doctorId !== undefined) updateData["doctorId"] = data.doctorId;
    if (data.date !== undefined) updateData["date"] = new Date(data.date);
    if (data.timeSlot !== undefined) updateData["timeSlot"] = data.timeSlot;
    if (data.type !== undefined) updateData["type"] = data.type;
    if (data.status !== undefined) updateData["status"] = data.status;
    if (data.notes !== undefined) updateData["notes"] = data.notes ?? null;

    const appt = await prisma.appointment.update({ where: { id }, data: updateData });
    return res.status(200).json({ status: "success", message: "Appointment updated.", data: appt });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ status: "error", message: "Appointment not found." });
    return res.status(500).json({ status: "error", message: "Update failed." });
  }
};

/**
 * @desc    Cancel / delete appointment
 * @route   DELETE /api/appointments/:id
 */
export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    await prisma.appointment.delete({ where: { id } });
    return res.status(200).json({ status: "success", message: "Appointment cancelled." });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ status: "error", message: "Appointment not found." });
    return res.status(500).json({ status: "error", message: "Failed to cancel appointment." });
  }
};
