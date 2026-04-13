import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../../prisma.js";
import { loginSchema, registerSchema } from "../../../zod/validation/auth.validation.js";

/**
 * @desc    Handle Personnel Authentication
 * @route   POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    // 1. Data Validation
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { personnelId, password } = validation.data;

    // 2. Identify Personnel Node
    const user = await prisma.login.findUnique({
      where: { personnelId },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Access Denied: Invalid credentials",
      });
    }

    // 3. Security Check (Password Comparison)
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401).json({
        success: false,
        message: "Access Denied: Invalid credentials",
      });
    }

    // 4. Institutional Status Check
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Access Revoked: Account deactivated by administration",
      });
    }

    // 5. Intelligence Session Initialization (JWT)
    const token = jwt.sign(
      { 
        sub: user.id, 
        pid: user.personnelId, 
        role: user.role 
      },
      process.env.JWT_SECRET || "medicare_erp_secure_2026",
      { expiresIn: "12h" }
    );

    // 6. Log Institutional Access
    await prisma.login.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // 7. Successful Handshake
    return res.status(200).json({
      success: true,
      message: "Credentials verified. Protocol initialized.",
      token,
      profile: {
        id: user.id,
        personnelId: user.personnelId,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("CRITICAL_AUTH_FAILURE:", error);
    return res.status(500).json({
      success: false,
      message: "Internal system error during authentication handshake",
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
        message: "Infrastructure Check Failed",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { personnelId, password, role } = validation.data;

    // Check for duplicate nodes
    const exists = await prisma.login.findUnique({ where: { personnelId } });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Personnel ID already exists in database",
      });
    }

    // Encrypt security key
    const hashedKey = await bcrypt.hash(password, 12);

    // Create entry
    const newUser = await prisma.login.create({
      data: {
        personnelId,
        password: hashedKey,
        role: role || "STAFF",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Personnel node initialized successfully",
      profile: {
        id: newUser.id,
        personnelId: newUser.personnelId,
        role: newUser.role,
      },
    });

  } catch (error) {
    console.error("CRITICAL_REG_FAILURE:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initialize personnel node",
    });
  }
};
