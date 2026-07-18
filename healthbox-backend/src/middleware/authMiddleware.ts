import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
  userFacility?: string;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader === undefined || authHeader === null) {
      res.status(401).json({ error: "No authorization header" });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (token === undefined || token === null || token === "") {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret === undefined || jwtSecret === null) {
      res.status(500).json({ error: "JWT_SECRET not configured" });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    res.status(401).json({ error: "Authentication failed" });
  }
}

export function requireRole(allowedRoles: string[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (req.userId === undefined || req.userId === null) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (user === null) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    req.userRole = user.role;
    req.userFacility = user.facility;
    next();
  };
}