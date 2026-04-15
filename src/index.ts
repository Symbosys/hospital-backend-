import "dotenv/config";

import express from "express";
import cors from "cors";
import { prisma } from "./prisma.js";
import errorMiddleware from "./middleware/error.middleware.js";

// Clinical Infrastructure
import loginRouter from "./module/login.js";
import departmentRouter from "./module/department.js";
import wardRouter from "./module/ward.js";
import bedRouter from "./module/bed.js";
import otRouter from "./module/ot.js";
import labRouter from "./module/lab.js";
import supplyChainRouter from "./module/supply-chain.js";

// Human Capital
import patientRouter from "./module/patient.js";
import doctorRouter from "./module/doctor.js";
import medicalStaffRouter from "./module/medical-staff.js";
import nonMedicalStaffRouter from "./module/non-medical-staff.js";

// Clinical Operations
import appointmentRouter from "./module/appointment.js";
import billingRouter from "./module/billing.js";
import ehrRouter from "./module/ehr.js";

console.log("------------------------------------------");
console.log(`🚀 ERP NODE [${new Date().toISOString()}] INITIALIZING`);
console.log("------------------------------------------");

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// ── Clinical Infrastructure ───────────────────────────────────────────────────
app.use("/api/auth", loginRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/wards", wardRouter);
app.use("/api/beds", bedRouter);
app.use("/api/ot", otRouter);
app.use("/api/lab", labRouter);
app.use("/api/supply-chain", supplyChainRouter);

// ── Human Capital ─────────────────────────────────────────────────────────────
app.use("/api/patients", patientRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/medical-staff", medicalStaffRouter);
app.use("/api/non-medical-staff", nonMedicalStaffRouter);

// ── Clinical Operations ───────────────────────────────────────────────────────
app.use("/api/appointments", appointmentRouter);
app.use("/api/billing", billingRouter);
app.use("/api/ehr", ehrRouter);

app.get("/", (req, res) => {
  res.json({ status: "online", timestamp: new Date().toISOString() });
});

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`✅ Institutional Infrastructure active on port ${port}`);
  console.log(`📡 ${14} API modules registered`);
});
