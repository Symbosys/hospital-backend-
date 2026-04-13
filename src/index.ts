import express from "express";
import dotenv from "dotenv";
import { prisma } from "./prisma.js";
import errorMiddleware from "./middleware/error.middleware.js";
import loginRouter from "./module/login.js";
import departmentRouter from "./module/department.js";
import wardRouter from "./module/ward.js";
import bedRouter from "./module/bed.js";
import otRouter from "./module/ot.js";
import labRouter from "./module/lab.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

// Comprehensive Analytical & Clinical Intelligence Suite
app.use("/api/auth", loginRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/wards", wardRouter);
app.use("/api/beds", bedRouter);
app.use("/api/ot", otRouter);
app.use("/api/lab", labRouter);











app.get("/", (req, res) => {
  res.json({ message: "Hospital Management ERP Backend Node [v1.2.0] synchronized" });
});



// Use error middleware (should be last)
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
