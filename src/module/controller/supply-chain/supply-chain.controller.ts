import type { Request, Response } from "express";
import { prisma } from "../../../prisma.js";
import { asyncHandler } from "../../../middleware/error.middleware.js";

// --- Blood Bank Telemetry ---

export const getBloodInventory = asyncHandler(async (req: Request, res: Response) => {
  const inventory = await prisma.bloodInventory.findMany({
    orderBy: { group: "asc" }
  });
  return res.status(200).json({ status: "success", data: inventory });
});

export const updateBloodStock = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { units, status } = req.body;
  
  console.log(`[LOGISTICS] Initiating blood stock update for node ${id}: units=${units}, status=${status}`);
  
  const updated = await prisma.bloodInventory.update({
    where: { id },
    data: { 
      units: Number(units), 
      status, 
      lastStocked: new Date() 
    }
  });
  return res.status(200).json({ status: "success", data: updated });
});

// --- Pharmacy Inventory ---

export const getPharmacyItems = asyncHandler(async (req: Request, res: Response) => {
  const items = await prisma.pharmacyItem.findMany({
    orderBy: { name: "asc" }
  });
  return res.status(200).json({ status: "success", data: items });
});

export const updatePharmacyItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { stock, status } = req.body;

  console.log(`[PHARMA] Initiating stock update for item ${id}: stock=${stock}, status=${status}`);

  const updated = await prisma.pharmacyItem.update({
    where: { id },
    data: { 
      stock: Number(stock), 
      status 
    }
  });
  return res.status(200).json({ status: "success", data: updated });
});

// --- Consumables & Surgical Supply ---

export const getConsumables = asyncHandler(async (req: Request, res: Response) => {
  const consumables = await prisma.consumable.findMany({
    orderBy: { category: "asc" }
  });
  return res.status(200).json({ status: "success", data: consumables });
});

export const updateConsumable = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { stock, status } = req.body;

  console.log(`[CONSUMABLES] Adjusting inventory for node ${id}: stock=${stock}, status=${status}`);

  const updated = await prisma.consumable.update({
    where: { id },
    data: { 
      stock: Number(stock), 
      status 
    }
  });
  return res.status(200).json({ status: "success", data: updated });
});

// --- Blood Donor Database ---

export const getDonors = asyncHandler(async (req: Request, res: Response) => {
  const donors = await prisma.bloodDonor.findMany({
    orderBy: { createdAt: "desc" }
  });
  return res.status(200).json({ status: "success", data: donors });
});

export const createDonor = asyncHandler(async (req: Request, res: Response) => {
  const { name, bloodGroup, phone } = req.body;
  const donor = await prisma.bloodDonor.create({
    data: { name, bloodGroup, phone }
  });
  return res.status(201).json({ status: "success", data: donor });
});
