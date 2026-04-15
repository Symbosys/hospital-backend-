import { Router } from "express";
import { getNonMedicalStaff, getNonMedicalStaffById, createNonMedicalStaff, updateNonMedicalStaff, deleteNonMedicalStaff } from "./controller/non-medical-staff/non-medical-staff.controller.js";

const router = Router();

router.get("/", getNonMedicalStaff);
router.get("/:id", getNonMedicalStaffById);
router.post("/", createNonMedicalStaff);
router.patch("/:id", updateNonMedicalStaff);
router.delete("/:id", deleteNonMedicalStaff);

export default router;
