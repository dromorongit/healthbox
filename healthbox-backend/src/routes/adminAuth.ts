import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export const adminAuthRouter: Router = Router();

interface AdminLoginBody {
  email: string;
  password: string;
}

function generateAdminTokens(adminUserId: string): { accessToken: string; refreshToken: string } {
  const jwtSecret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  if (jwtSecret === undefined || jwtSecret === null) {
    throw new Error("JWT_SECRET not configured");
  }
  if (refreshSecret === undefined || refreshSecret === null) {
    throw new Error("JWT_REFRESH_SECRET not configured");
  }

  const accessToken = jwt.sign({ adminUserId, type: "admin" }, jwtSecret, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ adminUserId, type: "admin" }, refreshSecret, { expiresIn: "7d" });

  return { accessToken, refreshToken };
}

adminAuthRouter.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as AdminLoginBody;

    if (body.email === undefined || body.email === null) {
      res.status(400).json({ error: "Email is required" });
      return;
    }
    if (body.password === undefined || body.password === null) {
      res.status(400).json({ error: "Password is required" });
      return;
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { email: body.email },
    });

    if (adminUser === null) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isValid = await bcrypt.compare(body.password, adminUser.passwordHash);
    if (isValid === false) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const tokens = generateAdminTokens(adminUser.id);

    res.json({
      admin: {
        id: adminUser.id,
        fullName: adminUser.fullName,
        email: adminUser.email,
        role: adminUser.role,
        facility: adminUser.facility,
      },
      ...tokens,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});