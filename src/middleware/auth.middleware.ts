import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.utils.js";
import { ErrorResponse } from "../utils/response.utils.js";
import { prisma } from "../prisma.js";
import { asyncHandler } from "./error.middleware.js"; 

interface JwtPayload {
  sub: string;
  pid: string;
  role: string;
}

export const protect = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ErrorResponse("Institutional access denied: Missing protocol token.", 401));
  }

  try {
    const decoded = verifyToken(token) as JwtPayload;

    if (!decoded || !decoded.sub) {
      return next(new ErrorResponse("Security handshake failed: Invalid protocol signature.", 401));
    }

    // Identify personnel node in the centralized authority
    const user = await prisma.login.findUnique({
      where: { id: decoded.sub },
    });

    if (!user) {
      return next(new ErrorResponse("Personnel node not found in registry.", 404));
    }

    if (!user.isActive) {
      return next(new ErrorResponse("Access Revoked: Account deactivated by administration.", 403));
    }

    // Attach verified personnel profile to the request
    req.user = {
      id: user.id,
      personnelId: user.personnelId,
      role: user.role,
    };

    next();
  } catch (error) {
    return next(new ErrorResponse("Authentication failure: Intelligence session expired.", 401));
  }
});

/**
 * Grant access to specific institutional roles (RBAC)
 */
export const authorize = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `Unauthorized Protocol: Access level ${req.user.role} restricted for this node.`,
          403
        )
      );
    }
    next();
  };
};
