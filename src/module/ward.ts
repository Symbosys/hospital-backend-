import { Router } from "express";
import { 
  getWards, 
  createWard, 
  updateWard, 
  deleteWard 
} from "./controller/ward/ward.controller.js";

const router = Router();

router.get("/", getWards);
router.post("/", createWard);
router.patch("/:id", updateWard);
router.delete("/:id", deleteWard);

export default router;
