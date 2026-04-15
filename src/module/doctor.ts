import { Router } from "express";
import { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor } from "./controller/doctor/doctor.controller.js";

const router = Router();

router.get("/", getDoctors);
router.get("/:id", getDoctorById);
router.post("/", createDoctor);
router.patch("/:id", updateDoctor);
router.delete("/:id", deleteDoctor);

export default router;
