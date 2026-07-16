-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "facility" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MalariaCase" (
    "id" TEXT NOT NULL,
    "patientFullName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "sex" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "community" TEXT NOT NULL,
    "isPregnant" BOOLEAN,
    "visitDate" TEXT NOT NULL,
    "facilityName" TEXT NOT NULL,
    "healthWorkerId" TEXT NOT NULL,
    "healthWorkerName" TEXT NOT NULL,
    "symptoms" TEXT,
    "temperature" DOUBLE PRECISION,
    "illnessDurationDays" INTEGER,
    "testType" TEXT NOT NULL,
    "rdtResult" TEXT NOT NULL,
    "microscopyResult" TEXT NOT NULL,
    "parasiteSpecies" TEXT,
    "parasiteDensity" TEXT,
    "diagnosisConfirmed" BOOLEAN NOT NULL,
    "treatmentGiven" TEXT NOT NULL,
    "dosageNotes" TEXT,
    "referredToHospital" BOOLEAN NOT NULL,
    "followUpRequired" BOOLEAN NOT NULL,
    "followUpDate" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MalariaCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");
