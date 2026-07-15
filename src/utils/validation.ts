import { CaseFormData } from "../types/case";

interface ValidationErrors {
  patientFullName?: string;
  age?: string;
  sex?: string;
  isPregnant?: string;
  community?: string;
  visitDate?: string;
  testType?: string;
  rdtResult?: string;
  microscopyResult?: string;
  treatmentGiven?: string;
  temperature?: string;
}

export function validateCaseForm(formData: CaseFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!formData.patientFullName || formData.patientFullName.trim() === "") {
    errors.patientFullName = "Patient full name is required";
  }

  if (!formData.age || formData.age.trim() === "") {
    errors.age = "Age is required";
  } else {
    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum <= 0) {
      errors.age = "Age must be a positive number";
    }
  }

  if (!formData.sex || formData.sex.trim() === "") {
    errors.sex = "Sex is required";
  } else if (formData.sex === "Female") {
    if (formData.isPregnant === null) {
      errors.isPregnant = "Pregnancy status is required for female patients";
    }
  }

  if (!formData.community || formData.community.trim() === "") {
    errors.community = "Community is required";
  }

  if (!formData.visitDate || formData.visitDate.trim() === "") {
    errors.visitDate = "Visit date is required";
  }

  if (!formData.testType || formData.testType.trim() === "") {
    errors.testType = "Test type is required";
  } else {
    if (formData.testType === "RDT" || formData.testType === "Both") {
      if (!formData.rdtResult || formData.rdtResult.trim() === "") {
        errors.rdtResult = "RDT result is required for selected test type";
      }
    }
    if (formData.testType === "Microscopy" || formData.testType === "Both") {
      if (!formData.microscopyResult || formData.microscopyResult.trim() === "") {
        errors.microscopyResult = "Microscopy result is required for selected test type";
      }
    }
  }

  if (!formData.treatmentGiven || formData.treatmentGiven.trim() === "") {
    errors.treatmentGiven = "Treatment given is required";
  }

  if (formData.temperature && formData.temperature.trim() !== "") {
    const tempNum = parseFloat(formData.temperature);
    if (isNaN(tempNum) || tempNum < 30 || tempNum > 45) {
      errors.temperature = "Temperature should be between 30°C and 45°C";
    }
  }

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).some((key) => errors[key as keyof ValidationErrors] !== undefined);
}