import { Router, Request, Response } from "express";
import { PrismaClient, MalariaCase as PrismaMalariaCase } from "@prisma/client";
import { authMiddleware, AuthenticatedRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

export const syncRouter = Router();

interface MalariaCaseInput {
  id: string;
  patientFullName: string;
  age: number;
  sex: string;
  phoneNumber: string | null;
  community: string;
  isPregnant: boolean | null;
  visitDate: string;
  facilityName: string;
  healthWorkerId: string;
  healthWorkerName: string;
  symptoms: string | null;
  temperature: number | null;
  illnessDurationDays: number | null;
  testType: string;
  rdtResult: string;
  microscopyResult: string;
  parasiteSpecies: string | null;
  parasiteDensity: string | null;
  diagnosisConfirmed: boolean;
  treatmentGiven: string;
  dosageNotes: string | null;
  referredToHospital: boolean;
  followUpRequired: boolean;
  followUpDate: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

syncRouter.post(
  "/cases",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (req.userId === undefined || req.userId === null) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    try {
      const cases = req.body as MalariaCaseInput[];
      if (cases === undefined || cases === null || !Array.isArray(cases)) {
        res.status(400).json({ error: "Request body must be an array of cases" });
        return;
      }

      const syncedIds: string[] = [];
      const failedIds: string[] = [];

      for (const malariaCase of cases) {
        try {
          await prisma.malariaCase.upsert({
            where: { id: malariaCase.id },
            create: {
              id: malariaCase.id,
              patientFullName: malariaCase.patientFullName,
              age: malariaCase.age,
              sex: malariaCase.sex,
              phoneNumber: malariaCase.phoneNumber,
              community: malariaCase.community,
              isPregnant: malariaCase.isPregnant,
              visitDate: malariaCase.visitDate,
              facilityName: malariaCase.facilityName,
              healthWorkerId: malariaCase.healthWorkerId,
              healthWorkerName: malariaCase.healthWorkerName,
              symptoms: malariaCase.symptoms,
              temperature: malariaCase.temperature,
              illnessDurationDays: malariaCase.illnessDurationDays,
              testType: malariaCase.testType,
              rdtResult: malariaCase.rdtResult,
              microscopyResult: malariaCase.microscopyResult,
              parasiteSpecies: malariaCase.parasiteSpecies,
              parasiteDensity: malariaCase.parasiteDensity,
              diagnosisConfirmed: malariaCase.diagnosisConfirmed,
              treatmentGiven: malariaCase.treatmentGiven,
              dosageNotes: malariaCase.dosageNotes,
              referredToHospital: malariaCase.referredToHospital,
              followUpRequired: malariaCase.followUpRequired,
              followUpDate: malariaCase.followUpDate,
              status: malariaCase.status,
              createdAt: new Date(malariaCase.createdAt),
              updatedAt: new Date(malariaCase.updatedAt),
            },
            update: {
              patientFullName: malariaCase.patientFullName,
              age: malariaCase.age,
              sex: malariaCase.sex,
              phoneNumber: malariaCase.phoneNumber,
              community: malariaCase.community,
              isPregnant: malariaCase.isPregnant,
              visitDate: malariaCase.visitDate,
              facilityName: malariaCase.facilityName,
              healthWorkerId: malariaCase.healthWorkerId,
              healthWorkerName: malariaCase.healthWorkerName,
              symptoms: malariaCase.symptoms,
              temperature: malariaCase.temperature,
              illnessDurationDays: malariaCase.illnessDurationDays,
              testType: malariaCase.testType,
              rdtResult: malariaCase.rdtResult,
              microscopyResult: malariaCase.microscopyResult,
              parasiteSpecies: malariaCase.parasiteSpecies,
              parasiteDensity: malariaCase.parasiteDensity,
              diagnosisConfirmed: malariaCase.diagnosisConfirmed,
              treatmentGiven: malariaCase.treatmentGiven,
              dosageNotes: malariaCase.dosageNotes,
              referredToHospital: malariaCase.referredToHospital,
              followUpRequired: malariaCase.followUpRequired,
              followUpDate: malariaCase.followUpDate,
              status: malariaCase.status,
              updatedAt: new Date(malariaCase.updatedAt),
            },
          });
          syncedIds.push(malariaCase.id);
        } catch (upsertError) {
          console.error(`Failed to sync case ${malariaCase.id}:`, upsertError);
          failedIds.push(malariaCase.id);
        }
      }

      res.json({ syncedIds, failedIds });
    } catch (error) {
      console.error("Sync cases error:", error);
      res.status(500).json({ error: "Failed to sync cases" });
    }
  }
);

syncRouter.get(
  "/cases",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (req.userId === undefined || req.userId === null) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
      });

      if (user === null) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const cases: PrismaMalariaCase[] = await prisma.malariaCase.findMany({
        where: { facilityName: user.facility },
        orderBy: { createdAt: "desc" },
      });

      res.json(cases);
    } catch (error) {
      console.error("Get cases error:", error);
      res.status(500).json({ error: "Failed to get cases" });
    }
  }
);