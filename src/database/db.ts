import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (db === null) {
    db = SQLite.openDatabaseSync("dhreambox.db");
    db.execSync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        fullName TEXT,
        phoneNumber TEXT UNIQUE,
        passwordHash TEXT,
        facility TEXT,
        role TEXT,
        createdAt TEXT
      );
      CREATE TABLE IF NOT EXISTS malaria_cases (
        id TEXT PRIMARY KEY,
        patientFullName TEXT,
        age INTEGER,
        sex TEXT,
        phoneNumber TEXT,
        community TEXT,
        isPregnant INTEGER,
        visitDate TEXT,
        facilityName TEXT,
        healthWorkerId TEXT,
        healthWorkerName TEXT,
        symptoms TEXT,
        temperature REAL,
        illnessDurationDays INTEGER,
        testType TEXT,
        rdtResult TEXT,
        microscopyResult TEXT,
        parasiteSpecies TEXT,
        parasiteDensity TEXT,
        diagnosisConfirmed INTEGER,
        treatmentGiven TEXT,
        dosageNotes TEXT,
        referredToHospital INTEGER,
        followUpRequired INTEGER,
        followUpDate TEXT,
        status TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );
    `);
  }
  return db;
}

export function initDb(): void {
  getDb();
  addSyncStatusColumn();
}

export function addSyncStatusColumn(): void {
  const db = getDb();
  const tableInfo = db.getAllSync<{ name: string }>("PRAGMA table_info(malaria_cases)");
  const hasSyncStatus = tableInfo.some((column) => column.name === "syncStatus");
  if (hasSyncStatus === false) {
    db.execSync("ALTER TABLE malaria_cases ADD COLUMN syncStatus TEXT DEFAULT 'unsynced'");
  }
}

export async function resetDatabase(): Promise<void> {
  try {
    const db = getDb();
    db.execSync(`
      DROP TABLE IF EXISTS malaria_cases;
      DROP TABLE IF EXISTS users;
    `);
    db.execSync(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        fullName TEXT,
        phoneNumber TEXT UNIQUE,
        passwordHash TEXT,
        facility TEXT,
        role TEXT,
        createdAt TEXT
      );
      CREATE TABLE malaria_cases (
        id TEXT PRIMARY KEY,
        patientFullName TEXT,
        age INTEGER,
        sex TEXT,
        phoneNumber TEXT,
        community TEXT,
        isPregnant INTEGER,
        visitDate TEXT,
        facilityName TEXT,
        healthWorkerId TEXT,
        healthWorkerName TEXT,
        symptoms TEXT,
        temperature REAL,
        illnessDurationDays INTEGER,
        testType TEXT,
        rdtResult TEXT,
        microscopyResult TEXT,
        parasiteSpecies TEXT,
        parasiteDensity TEXT,
        diagnosisConfirmed INTEGER,
        treatmentGiven TEXT,
        dosageNotes TEXT,
        referredToHospital INTEGER,
        followUpRequired INTEGER,
        followUpDate TEXT,
        status TEXT,
        syncStatus TEXT DEFAULT 'unsynced',
        createdAt TEXT,
        updatedAt TEXT
      );
    `);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to reset database: ${error.message}`);
    }
    throw new Error("Failed to reset database");
  }
}