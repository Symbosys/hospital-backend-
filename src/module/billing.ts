import { Router } from "express";
import { getBillingRecords, getBillingById, createBillingRecord, updateBillingRecord, deleteBillingRecord } from "./controller/billing/billing.controller.js";

const router = Router();

router.get("/", getBillingRecords);
router.get("/:id", getBillingById);
router.post("/", createBillingRecord);
router.patch("/:id", updateBillingRecord);
router.delete("/:id", deleteBillingRecord);

export default router;
