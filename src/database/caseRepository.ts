import { getDb } from "./db";
import * as Crypto from "expo-crypto";
import { MalariaCase } from "../types/case";

export { MalariaCase } from "../types/case";

export async function createCase(caseData: Omit<MalariaCase, "id" | "createdAt" | "updatedAt" | "syncStatus">): Promise<MalariaCase> {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    const id = Crypto.randomUUID();

    const values = [
      id,
      caseData.patientFullName,
      caseData.age,
      caseData.sex,
      caseData.phoneNumber,
      caseData.community,
      caseData.isPregnant,
      caseData.visitDate,
      caseData.facilityName,
      caseData.healthWorkerId,
      caseData.healthWorkerName,
      caseData.symptoms,
      caseData.temperature,
      caseData.illnessDurationDays,
      caseData.testType,
      caseData.rdtResult,
      caseData.microscopyResult,
      caseData.parasiteSpecies,
      caseData.parasiteDensity,
      caseData.diagnosisConfirmed,
      caseData.treatmentGiven,
      caseData.dosageNotes,
      caseData.referredToHospital,
      caseData.followUpRequired,
      caseData.followUpDate,
      caseData.status,
      now,
      now,
      "unsynced",
    ];
    db.runSync(
      `INSERT INTO malaria_cases (
        id, patientFullName, age, sex, phoneNumber, community, isPregnant,
        visitDate, facilityName, healthWorkerId, healthWorkerName, symptoms,
        temperature, illnessDurationDays, testType, rdtResult, microscopyResult,
        parasiteSpecies, parasiteDensity, diagnosisConfirmed, treatmentGiven,
        dosageNotes, referredToHospital, followUpRequired, followUpDate, status,
        createdAt, updatedAt, syncStatus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values
    );

    return { ...caseData, id, createdAt: now, updatedAt: now, syncStatus: "unsynced" };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create case: ${error.message}`);
    }
    throw new Error("Failed to create case");
  }
}

export async function updateCase(id: string, caseData: Partial<Omit<MalariaCase, "id" | "createdAt" | "updatedAt">>): Promise<void> {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    
    const fields = Object.keys(caseData);
    const values = Object.values(caseData);
    
    if (fields.length === 0) {
      return;
    }
    
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    db.runSync(
      `UPDATE malaria_cases SET ${setClause}, updatedAt = ? WHERE id = ?`,
      [...values, now, id]
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update case: ${error.message}`);
    }
    throw new Error("Failed to update case");
  }
}

export async function getAllCases(): Promise<MalariaCase[]> {
  try {
    const db = getDb();
    const results = db.getAllSync<MalariaCase>(
      "SELECT * FROM malaria_cases ORDER BY createdAt DESC"
    );
    return results;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get cases: ${error.message}`);
    }
    throw new Error("Failed to get cases");
  }
}

export async function getCaseById(id: string): Promise<MalariaCase | null> {
  try {
    const db = getDb();
    const results = db.getAllSync<MalariaCase>("SELECT * FROM malaria_cases WHERE id = ?", [id]);
    if (results.length === 0) {
      return null;
    }
    return results[0];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get case: ${error.message}`);
    }
    throw new Error("Failed to get case");
  }
}

export async function getCasesByStatus(status: "draft" | "submitted"): Promise<MalariaCase[]> {
  try {
    const db = getDb();
    const results = db.getAllSync<MalariaCase>(
      "SELECT * FROM malaria_cases WHERE status = ? ORDER BY createdAt DESC",
      [status]
    );
    return results;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get cases by status: ${error.message}`);
    }
    throw new Error("Failed to get cases by status");
  }
}

export async function deleteCase(id: string): Promise<void> {
  try {
    const db = getDb();
    db.runSync("DELETE FROM malaria_cases WHERE id = ?", [id]);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to delete case: ${error.message}`);
    }
    throw new Error("Failed to delete case");
  }
}

export async function getCasesNeedingSync(): Promise<MalariaCase[]> {
  try {
    const db = getDb();
    const results = db.getAllSync<MalariaCase>(
      "SELECT * FROM malaria_cases WHERE syncStatus IN ('unsynced', 'sync_failed') AND status = 'submitted' ORDER BY createdAt ASC"
    );
    return results;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get cases needing sync: ${error.message}`);
    }
    throw new Error("Failed to get cases needing sync");
  }
}

export async function setSyncStatus(
  id: string,
  syncStatus: "unsynced" | "syncing" | "synced" | "sync_failed"
): Promise<void> {
  try {
    const db = getDb();
    db.runSync("UPDATE malaria_cases SET syncStatus = ? WHERE id = ?", [syncStatus, id]);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update sync status: ${error.message}`);
    }
    throw new Error("Failed to update sync status");
  }
}

export async function getUnsyncedCount(): Promise<number> {
  try {
    const db = getDb();
    const results = db.getAllSync<{ count: number }>(
      "SELECT COUNT(*) as count FROM malaria_cases WHERE syncStatus IN ('unsynced', 'sync_failed') AND status = 'submitted'"
    );
    return results.length > 0 ? results[0].count : 0;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to count unsynced cases: ${error.message}`);
    }
    throw new Error("Failed to count unsynced cases");
  }
}