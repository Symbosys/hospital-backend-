import { Router } from "express";
import { getMedicalStaff, getMedicalStaffById, createMedicalStaff, updateMedicalStaff, deleteMedicalStaff } from "./controller/medical-staff/medical-staff.controller.js";

const router = Router();

router.get("/", getMedicalStaff);
router.get("/:id", getMedicalStaffById);
router.post("/", createMedicalStaff);
router.patch("/:id", updateMedicalStaff);
router.delete("/:id", deleteMedicalStaff);

export default router;
