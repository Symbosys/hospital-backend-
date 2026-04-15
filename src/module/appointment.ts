import { Router } from "express";
import { getAppointments, getAppointmentById, createAppointment, updateAppointment, deleteAppointment } from "./controller/appointment/appointment.controller.js";

const router = Router();

router.get("/", getAppointments);
router.get("/:id", getAppointmentById);
router.post("/", createAppointment);
router.patch("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

export default router;
