import { Router } from "express";
import { 
  getBloodInventory, 
  updateBloodStock, 
  getPharmacyItems, 
  updatePharmacyItem,
  getConsumables,
  updateConsumable,
  getDonors,
  createDonor
} from "./controller/supply-chain/supply-chain.controller.js";

const router = Router();

router.get("/blood-bank", getBloodInventory);
router.patch("/blood-bank/:id", updateBloodStock);

router.get("/pharmacy", getPharmacyItems);
router.patch("/pharmacy/:id", updatePharmacyItem);

router.get("/consumables", getConsumables);
router.patch("/consumables/:id", updateConsumable);

router.get("/donors", getDonors);
router.post("/donors", createDonor);

export default router;
