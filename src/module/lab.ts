import { Router } from "express";
import { 
  getLabTests,
  getLabTestById,
  createLabTest,
  updateLabTest,
  deleteLabTest
} from "./controller/lab/lab.controller.js";

const router = Router();

router.get("/", getLabTests);
router.get("/:id", getLabTestById);
router.post("/", createLabTest);
router.patch("/:id", updateLabTest);
router.delete("/:id", deleteLabTest);

export default router;
