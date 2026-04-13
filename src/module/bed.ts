import { Router } from "express";
import { 
  getBeds, 
  createBed, 
  updateBed, 
  deleteBed 
} from "./controller/bed/bed.controller.js";

const router = Router();

router.get("/", getBeds);
router.post("/", createBed);
router.patch("/:id", updateBed);
router.delete("/:id", deleteBed);

export default router;
