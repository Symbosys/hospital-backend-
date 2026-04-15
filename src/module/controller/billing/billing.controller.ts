import type { Request, Response } from "express";
import { prisma } from "../../../prisma.js";
import { billingSchema, updateBillingSchema } from "../../../zod/validation/billing.validation.js";

/**
 * @desc    Fetch all billing records
 * @route   GET /api/billing
 */
export const getBillingRecords = async (req: Request, res: Response) => {
  try {
    const status = req.query["status"] as string | undefined;
    const category = req.query["category"] as string | undefined;
    const patientId = req.query["patientId"] as string | undefined;

    const where: Record<string, unknown> = {};
    if (status) where["status"] = status;
    if (category) where["category"] = category;
    if (patientId) where["patientId"] = patientId;

    const records = await prisma.billingRecord.findMany({
      where,
      include: { patient: { select: { name: true, patientId: true } } },
      orderBy: { issuedOn: "desc" },
    });

    return res.status(200).json({ status: "success", data: records });
  } catch (error) {
    console.error("BILLING_FETCH_ERROR:", error);
    return res.status(500).json({ status: "error", message: "Billing registry unreachable." });
  }
};

/**
 * @desc    Get a single billing record
 * @route   GET /api/billing/:id
 */
export const getBillingById = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const record = await prisma.billingRecord.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!record) return res.status(404).json({ status: "error", message: "Billing record not found." });
    return res.status(200).json({ status: "success", data: record });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Internal server error." });
  }
};

/**
 * @desc    Create a billing record
 * @route   POST /api/billing
 */
export const createBillingRecord = async (req: Request, res: Response) => {
  try {
    const validation = billingSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ status: "error", message: "Validation failed.", errors: validation.error.flatten().fieldErrors });
    }

    const data = validation.data;
    const record = await prisma.billingRecord.create({
      data: {
        billId: data.billId,
        patientId: data.patientId,
        amount: data.amount,
        paidAmount: data.paidAmount ?? 0,
        category: data.category,
        status: data.status ?? "Pending",
        paymentMode: data.paymentMode ?? null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });

    return res.status(201).json({ status: "success", message: "Billing record created.", data: record });
  } catch (error: any) {
    if (error.code === "P2002") return res.status(409).json({ status: "error", message: "Bill ID already exists." });
    if (error.code === "P2003") return res.status(404).json({ status: "error", message: "Referenced patient not found." });
    console.error("BILLING_CREATE_ERROR:", error);
    return res.status(500).json({ status: "error", message: "Failed to create billing record." });
  }
};

/**
 * @desc    Update billing record (payment status, amount paid, etc.)
 * @route   PATCH /api/billing/:id
 */
export const updateBillingRecord = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const validation = updateBillingSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ status: "error", errors: validation.error.flatten().fieldErrors });
    }

    const data = validation.data;
    const updateData: Record<string, unknown> = {};
    if (data.billId !== undefined) updateData["billId"] = data.billId;
    if (data.patientId !== undefined) updateData["patientId"] = data.patientId;
    if (data.amount !== undefined) updateData["amount"] = data.amount;
    if (data.paidAmount !== undefined) updateData["paidAmount"] = data.paidAmount;
    if (data.category !== undefined) updateData["category"] = data.category;
    if (data.status !== undefined) updateData["status"] = data.status;
    if (data.paymentMode !== undefined) updateData["paymentMode"] = data.paymentMode;
    if (data.dueDate !== undefined) updateData["dueDate"] = new Date(data.dueDate);

    const record = await prisma.billingRecord.update({ where: { id }, data: updateData });
    return res.status(200).json({ status: "success", message: "Billing record updated.", data: record });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ status: "error", message: "Billing record not found." });
    return res.status(500).json({ status: "error", message: "Update failed." });
  }
};

/**
 * @desc    Delete a billing record
 * @route   DELETE /api/billing/:id
 */
export const deleteBillingRecord = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    await prisma.billingRecord.delete({ where: { id } });
    return res.status(200).json({ status: "success", message: "Billing record deleted." });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ status: "error", message: "Billing record not found." });
    return res.status(500).json({ status: "error", message: "Failed to delete billing record." });
  }
};
