import { Router } from "express";
import { getPatients, getPatientById, createPatient, updatePatient, deletePatient } from "./controller/patient/patient.controller.js";

const router = Router();

router.get("/", getPatients);
router.get("/:id", getPatientById);
router.post("/", createPatient);
router.patch("/:id", updatePatient);
router.delete("/:id", deletePatient);

export default router;
