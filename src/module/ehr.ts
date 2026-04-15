import { Router } from "express";
import { getEhrRecords, getEhrById, createEhrRecord, updateEhrRecord, deleteEhrRecord } from "./controller/ehr/ehr.controller.js";

const router = Router();

router.get("/", getEhrRecords);
router.get("/:id", getEhrById);
router.post("/", createEhrRecord);
router.patch("/:id", updateEhrRecord);
router.delete("/:id", deleteEhrRecord);

export default router;
