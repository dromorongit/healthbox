export interface MalariaCase {
  id: string;
  patientFullName: string;
  age: number;
  sex: "Male" | "Female";
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
  testType: "RDT" | "Microscopy" | "Both";
  rdtResult: "Positive" | "Negative" | "Not Done";
  microscopyResult: "Positive" | "Negative" | "Not Done";
  parasiteSpecies: string | null;
  parasiteDensity: string | null;
  diagnosisConfirmed: number;
  treatmentGiven: string;
  dosageNotes: string | null;
  referredToHospital: number;
  followUpRequired: number;
  followUpDate: string | null;
  status: "draft" | "submitted";
  createdAt: string;
  updatedAt: string;
  syncStatus?: "unsynced" | "syncing" | "synced" | "sync_failed";
}

export const SYMPTOM_OPTIONS = [
  "Fever",
  "Headache",
  "Chills",
  "Sweats",
  "Nausea",
  "Vomiting",
  "Muscle/Joint Pain",
  "Fatigue",
  "Cough",
  "Abdominal Pain",
];

export const TEST_TYPE_OPTIONS: Array<"RDT" | "Microscopy" | "Both"> = [
  "RDT",
  "Microscopy",
  "Both",
];

export const RESULT_OPTIONS: Array<"Positive" | "Negative" | "Not Done"> = [
  "Positive",
  "Negative",
  "Not Done",
];

export const SPECIES_OPTIONS = [
  "Plasmodium falciparum",
  "Plasmodium vivax",
  "Plasmodium malariae",
  "Plasmodium ovale",
  "Not Specified",
];

export const TREATMENT_OPTIONS = [
  "Artemether-Lumefantrine (AL)",
  "Artesunate-Amodiaquine (AS-AQ)",
  "Dihydroartemisinin-Piperaquine (DHAP)",
  "Quinine",
  "No Treatment Given",
];

export type CaseFormData = {
  patientFullName: string;
  age: string;
  sex: "Male" | "Female" | "";
  phoneNumber: string;
  community: string;
  isPregnant: number | null;
  visitDate: string;
  facilityName: string;
  healthWorkerId: string;
  healthWorkerName: string;
  symptoms: string | null;
  temperature: string;
  illnessDurationDays: string;
  testType: "RDT" | "Microscopy" | "Both" | "";
  rdtResult: "Positive" | "Negative" | "Not Done" | "";
  microscopyResult: "Positive" | "Negative" | "Not Done" | "";
  parasiteSpecies: string | null;
  parasiteDensity: string | null;
  diagnosisConfirmed: number;
  treatmentGiven: string;
  dosageNotes: string | null;
  referredToHospital: number;
  followUpRequired: number;
  followUpDate: string;
};