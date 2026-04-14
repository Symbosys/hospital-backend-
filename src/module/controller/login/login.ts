import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { prisma } from "../../../prisma.js";
import { loginSchema, registerSchema } from "../../../zod/validation/auth.validation.js";
import { asyncHandler } from "../../../middleware/error.middleware.js";

/**
 * @desc    Handle Personnel Authentication
 * @route   POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Identification Protocol Failed: Invalid input format",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { personnelId, password } = validation.data;
    console.log("Authentication scan initiated for:", personnelId);

    // 1. Identify Personnel Node in Institutional Data Layer
    const user = await prisma.user.findUnique({
      where: { personnelId },
    });

    if (!user) {
      console.warn("Identification failure: ID not found", personnelId);
      return res.status(401).json({
        success: false,
        message: "Access Denied: Personnel ID not recognized",
      });
    }

    // 2. Validate Security Credentials
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      console.warn("Security violation: Invalid key for", personnelId);
      return res.status(401).json({
        success: false,
        message: "Access Denied: Invalid security credentials",
      });
    }

    // 3. Status Validation
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Access Revoked: Account deactivated by administration",
      });
    }

    // 4. Session Initialization (JWT)
    const token = jwt.sign(
      { sub: user.id, pid: user.personnelId, role: user.role },
      process.env.JWT_SECRET || "medicare_erp_secure_2026",
      { expiresIn: "12h" }
    );

    // 5. Update Telemetry
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    }).catch(e => console.error("Telemetry update failed", e));

    console.log("Authentication successful for:", personnelId);
    
    return res.status(200).json({
      success: true,
      message: "Credentials verified. Institutional access granted.",
      token,
      profile: {
        id: user.id,
        personnelId: user.personnelId,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("DISTRIBUTED_CORE_FAILURE:", error);

    return res.status(500).json({
      success: false,
      message: "Internal system error during authentication handshake",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * @desc    Initialize New Personnel Node
 * @route   POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { personnelId, password, role } = validation.data;

    // Check availability
    const exists = await prisma.user.findUnique({ where: { personnelId } });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Personnel ID already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        personnelId,
        password: hashedPassword,
        role: role as any || "STAFF",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Personnel node initialized",
      profile: {
        id: newUser.id,
        personnelId: newUser.personnelId,
        role: newUser.role,
      },
    });

  } catch (error) {
    console.error("REGISTRATION_FAILURE:", error);
    return res.status(500).json({
      success: false,
      message: "Internal system error during registration",
    });
  }
};
