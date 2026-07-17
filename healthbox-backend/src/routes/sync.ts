import { Router, Response } from "express";
import { MalariaCase as PrismaMalariaCase } from "@prisma/client";
import { authMiddleware, AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../lib/prisma";

export const syncRouter: Router = Router();

interface MalariaCaseInput {
  id: string;
  patientFullName: string;
  age: number;
  sex: string;
  phoneNumber: string | null;
  community: string;
  isPregnant: number | null;
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
  diagnosisConfirmed: number;
  treatmentGiven: string;
  dosageNotes: string | null;
  referredToHospital: number;
  followUpRequired: number;
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

      for (const caseInput of cases) {
        try {
          await prisma.malariaCase.upsert({
            where: { id: caseInput.id },
            create: {
              id: caseInput.id,
              patientFullName: caseInput.patientFullName,
              age: caseInput.age,
              sex: caseInput.sex,
              phoneNumber: caseInput.phoneNumber,
              community: caseInput.community,
              isPregnant: caseInput.isPregnant === null ? null : Boolean(caseInput.isPregnant),
              visitDate: caseInput.visitDate,
              facilityName: caseInput.facilityName,
              healthWorkerId: caseInput.healthWorkerId,
              healthWorkerName: caseInput.healthWorkerName,
              symptoms: caseInput.symptoms,
              temperature: caseInput.temperature,
              illnessDurationDays: caseInput.illnessDurationDays,
              testType: caseInput.testType,
              rdtResult: caseInput.rdtResult,
              microscopyResult: caseInput.microscopyResult,
              parasiteSpecies: caseInput.parasiteSpecies,
              parasiteDensity: caseInput.parasiteDensity,
              diagnosisConfirmed: Boolean(caseInput.diagnosisConfirmed),
              treatmentGiven: caseInput.treatmentGiven,
              dosageNotes: caseInput.dosageNotes,
              referredToHospital: Boolean(caseInput.referredToHospital),
              followUpRequired: Boolean(caseInput.followUpRequired),
              followUpDate: caseInput.followUpDate,
              status: caseInput.status,
              createdAt: new Date(caseInput.createdAt),
              updatedAt: new Date(caseInput.updatedAt),
            },
            update: {
              patientFullName: caseInput.patientFullName,
              age: caseInput.age,
              sex: caseInput.sex,
              phoneNumber: caseInput.phoneNumber,
              community: caseInput.community,
              isPregnant: caseInput.isPregnant === null ? null : Boolean(caseInput.isPregnant),
              visitDate: caseInput.visitDate,
              facilityName: caseInput.facilityName,
              healthWorkerId: caseInput.healthWorkerId,
              healthWorkerName: caseInput.healthWorkerName,
              symptoms: caseInput.symptoms,
              temperature: caseInput.temperature,
              illnessDurationDays: caseInput.illnessDurationDays,
              testType: caseInput.testType,
              rdtResult: caseInput.rdtResult,
              microscopyResult: caseInput.microscopyResult,
              parasiteSpecies: caseInput.parasiteSpecies,
              parasiteDensity: caseInput.parasiteDensity,
              diagnosisConfirmed: Boolean(caseInput.diagnosisConfirmed),
              treatmentGiven: caseInput.treatmentGiven,
              dosageNotes: caseInput.dosageNotes,
              referredToHospital: Boolean(caseInput.referredToHospital),
              followUpRequired: Boolean(caseInput.followUpRequired),
              followUpDate: caseInput.followUpDate,
              status: caseInput.status,
              updatedAt: new Date(caseInput.updatedAt),
            },
          });
          syncedIds.push(caseInput.id);
        } catch (upsertError) {
          const errorMessage = upsertError instanceof Error ? upsertError.message : String(upsertError);
          console.error(`Failed to sync case ${caseInput.id}:`, errorMessage);
          failedIds.push(caseInput.id);
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