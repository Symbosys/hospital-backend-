import { Router } from "express";
import { 
  getOTs, 
  createOT, 
  updateOT, 
  deleteOT 
} from "./controller/ot/ot.controller.js";

const router = Router();

router.get("/", getOTs);
router.post("/", createOT);
router.patch("/:id", updateOT);
router.delete("/:id", deleteOT);

export default router;
