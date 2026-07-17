import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AdminAuthenticatedRequest extends Request {
  adminUserId?: string;
}

export function adminAuthMiddleware(
  req: AdminAuthenticatedRequest,
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

    const decoded = jwt.verify(token, jwtSecret) as { adminUserId: string; type: string };

    if (decoded.type !== "admin") {
      res.status(401).json({ error: "Invalid token type - admin access required" });
      return;
    }

    req.adminUserId = decoded.adminUserId;
    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    res.status(401).json({ error: "Authentication failed" });
  }
}