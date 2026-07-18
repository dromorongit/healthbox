import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export const authRouter: Router = Router();

interface RegisterBody {
  fullName: string;
  phoneNumber: string;
  password: string;
  facility: string;
  role: "field_worker" | "supervisor" | "team_leader";
}

interface LoginBody {
  phoneNumber: string;
  password: string;
}

function generateTokens(userId: string) {
  const jwtSecret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  if (jwtSecret === undefined || jwtSecret === null) {
    throw new Error("JWT_SECRET not configured");
  }
  if (refreshSecret === undefined || refreshSecret === null) {
    throw new Error("JWT_REFRESH_SECRET not configured");
  }

  const accessToken = jwt.sign({ userId }, jwtSecret, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId }, refreshSecret, { expiresIn: "7d" });

  return { accessToken, refreshToken };
}

authRouter.post("/register", async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as RegisterBody;

      if (body.fullName === undefined || body.fullName === null) {
        res.status(400).json({ error: "Full name is required" });
        return;
      }
      if (body.phoneNumber === undefined || body.phoneNumber === null) {
        res.status(400).json({ error: "Phone number is required" });
        return;
      }
      if (body.password === undefined || body.password === null) {
        res.status(400).json({ error: "Password is required" });
        return;
      }
      if (body.facility === undefined || body.facility === null) {
        res.status(400).json({ error: "Facility is required" });
        return;
      }
      if (body.role === undefined || body.role === null) {
        res.status(400).json({ error: "Role is required" });
        return;
      }

      const normalizedPhone = body.phoneNumber.replace(/\D/g, "");
      const passwordHash = await bcrypt.hash(body.password, 10);

      const user = await prisma.user.create({
        data: {
          fullName: body.fullName,
          phoneNumber: normalizedPhone,
          passwordHash,
          facility: body.facility,
          role: body.role,
        },
      });

      const tokens = generateTokens(user.id);

      res.status(201).json({
        user: {
          id: user.id,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          facility: user.facility,
          role: user.role,
        },
        ...tokens,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unique constraint")) {
        res.status(409).json({ error: "Phone number already registered" });
        return;
      }
      console.error("Register error:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

authRouter.post("/login", async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as LoginBody;

      if (body.phoneNumber === undefined || body.phoneNumber === null) {
        res.status(400).json({ error: "Phone number is required" });
        return;
      }
      if (body.password === undefined || body.password === null) {
        res.status(400).json({ error: "Password is required" });
        return;
      }

      const normalizedPhone = body.phoneNumber.replace(/\D/g, "");
      const user = await prisma.user.findUnique({
        where: { phoneNumber: normalizedPhone },
      });

      if (user === null) {
        res.status(401).json({ error: "Invalid phone number or password" });
        return;
      }

      const isValid = await bcrypt.compare(body.password, user.passwordHash);
      if (isValid === false) {
        res.status(401).json({ error: "Invalid phone number or password" });
        return;
      }

      const tokens = generateTokens(user.id);

      res.json({
        user: {
          id: user.id,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          facility: user.facility,
          role: user.role,
        },
        ...tokens,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });