import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScreenContainer } from "../components/ScreenContainer";
import { TextInputField } from "../components/TextInputField";
import { Button } from "../components/Button";
import { FormSection } from "../components/FormSection";
import { RadioGroup } from "../components/RadioGroup";
import { CheckboxGroup } from "../components/CheckboxGroup";
import { Dropdown } from "../components/Dropdown";
import { useAuth } from "../context/AuthContext";
import { createCase, updateCase } from "../database/caseRepository";
import { validateCaseForm, hasErrors } from "../utils/validation";
import { CaseFormData, SYMPTOM_OPTIONS, TEST_TYPE_OPTIONS, RESULT_OPTIONS, SPECIES_OPTIONS, TREATMENT_OPTIONS, MalariaCase } from "../types/case";

type Props = {
  route: { params?: { case?: MalariaCase } };
  navigation: any;
};

export const AddCaseScreen: React.FC<Props> = ({ route, navigation }) => {
  const { currentUser } = useAuth();
  const editingCase = route.params?.case as MalariaCase | undefined;
  const isEditing = !!editingCase;

  const [formData, setFormData] = useState<CaseFormData>({
    patientFullName: "",
    age: "",
    sex: "",
    phoneNumber: "",
    community: "",
    isPregnant: null,
    visitDate: "",
    facilityName: currentUser?.facility ?? "",
    healthWorkerId: currentUser?.id ?? "",
    healthWorkerName: currentUser?.fullName ?? "",
    symptoms: null,
    temperature: "",
    illnessDurationDays: "",
    testType: "",
    rdtResult: "",
    microscopyResult: "",
    parasiteSpecies: null,
    parasiteDensity: null,
    diagnosisConfirmed: 0,
    treatmentGiven: "",
    dosageNotes: null,
    referredToHospital: 0,
    followUpRequired: 0,
    followUpDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [symptomsSelected, setSymptomsSelected] = useState<string[]>([]);

  useEffect(() => {
    if (editingCase) {
      setFormData({
        patientFullName: editingCase.patientFullName,
        age: String(editingCase.age),
        sex: editingCase.sex,
        phoneNumber: editingCase.phoneNumber ?? "",
        community: editingCase.community,
        isPregnant: editingCase.isPregnant,
        visitDate: editingCase.visitDate,
        facilityName: editingCase.facilityName,
        healthWorkerId: editingCase.healthWorkerId,
        healthWorkerName: editingCase.healthWorkerName,
        symptoms: editingCase.symptoms,
        temperature: editingCase.temperature !== null ? String(editingCase.temperature) : "",
        illnessDurationDays: editingCase.illnessDurationDays !== null ? String(editingCase.illnessDurationDays) : "",
        testType: editingCase.testType,
        rdtResult: editingCase.rdtResult,
        microscopyResult: editingCase.microscopyResult,
        parasiteSpecies: editingCase.parasiteSpecies,
        parasiteDensity: editingCase.parasiteDensity,
        diagnosisConfirmed: editingCase.diagnosisConfirmed,
        treatmentGiven: editingCase.treatmentGiven,
        dosageNotes: editingCase.dosageNotes,
        referredToHospital: editingCase.referredToHospital,
        followUpRequired: editingCase.followUpRequired,
        followUpDate: editingCase.followUpDate ?? "",
      });
      if (editingCase.symptoms) {
        setSymptomsSelected(editingCase.symptoms.split(", "));
      }
    } else {
      const today = new Date().toISOString().split("T")[0];
      setFormData((prev) => ({
        ...prev,
        visitDate: today,
      }));
    }
  }, [editingCase, currentUser]);

  const updateField = (field: keyof CaseFormData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSave = async (status: "draft" | "submitted") => {
    if (status === "submitted") {
      const validationErrors = validateCaseForm(formData);
      const filteredErrors: Record<string, string> = {};
      Object.entries(validationErrors).forEach(([key, value]) => {
        if (value) {
          filteredErrors[key] = value;
        }
      });

      if (hasErrors(validationErrors)) {
        setErrors(filteredErrors);
        return;
      }
    }

    try {
      const caseData: Omit<MalariaCase, "id" | "createdAt" | "updatedAt"> = {
        patientFullName: formData.patientFullName,
        age: parseInt(formData.age, 10),
        sex: formData.sex as "Male" | "Female",
        phoneNumber: formData.phoneNumber || null,
        community: formData.community,
        isPregnant: formData.isPregnant,
        visitDate: formData.visitDate,
        facilityName: formData.facilityName,
        healthWorkerId: formData.healthWorkerId,
        healthWorkerName: formData.healthWorkerName,
        symptoms: symptomsSelected.length > 0 ? symptomsSelected.join(", ") : null,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        illnessDurationDays: formData.illnessDurationDays ? parseInt(formData.illnessDurationDays, 10) : null,
        testType: formData.testType as "RDT" | "Microscopy" | "Both",
        rdtResult: formData.rdtResult as "Positive" | "Negative" | "Not Done",
        microscopyResult: formData.microscopyResult as "Positive" | "Negative" | "Not Done",
        parasiteSpecies: formData.parasiteSpecies,
        parasiteDensity: formData.parasiteDensity,
        diagnosisConfirmed: formData.diagnosisConfirmed,
        treatmentGiven: formData.treatmentGiven,
        dosageNotes: formData.dosageNotes,
        referredToHospital: formData.referredToHospital,
        followUpRequired: formData.followUpRequired,
        followUpDate: formData.followUpDate || null,
        status,
      };

      if (isEditing && editingCase) {
        await updateCase(editingCase.id, caseData);
      } else {
        await createCase(caseData);
      }

      navigation.navigate("CaseList");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      }
    }
  };

  const showParasiteSpecies = 
    (formData.testType === "RDT" || formData.testType === "Microscopy" || formData.testType === "Both") &&
    (formData.rdtResult === "Positive" || formData.microscopyResult === "Positive");

  return (
    <ScreenContainer>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <FormSection title="Patient Info">
          <TextInputField
            label="Full Name *"
            value={formData.patientFullName}
            onChangeText={(v) => updateField("patientFullName", v)}
            error={errors.patientFullName}
          />
          <TextInputField
            label="Age *"
            value={formData.age}
            onChangeText={(v) => updateField("age", v)}
            keyboardType="numeric"
            error={errors.age}
          />
          <RadioGroup
            label="Sex *"
            options={["Male", "Female"]}
            selected={formData.sex}
            onSelect={(v) => updateField("sex", v)}
            error={errors.sex}
          />
          <TextInputField
            label="Phone Number"
            value={formData.phoneNumber}
            onChangeText={(v) => updateField("phoneNumber", v)}
            placeholder="Optional"
            keyboardType="phone-pad"
          />
          <TextInputField
            label="Community *"
            value={formData.community}
            onChangeText={(v) => updateField("community", v)}
            error={errors.community}
          />
          {formData.sex === "Female" && (
            <RadioGroup
              label="Is Pregnant *"
              options={["Yes", "No"]}
              selected={formData.isPregnant === 1 ? "Yes" : formData.isPregnant === 0 ? "No" : ""}
              onSelect={(v) => updateField("isPregnant", v === "Yes" ? 1 : 0)}
              error={errors.isPregnant}
            />
          )}
        </FormSection>

        <FormSection title="Visit Info">
          <TextInputField
            label="Visit Date *"
            value={formData.visitDate}
            onChangeText={(v) => updateField("visitDate", v)}
            placeholder="YYYY-MM-DD"
            error={errors.visitDate}
          />
          <TextInputField
            label="Facility"
            value={formData.facilityName}
            editable={false}
          />
          <TextInputField
            label="Health Worker"
            value={formData.healthWorkerName}
            editable={false}
          />
        </FormSection>

        <FormSection title="Clinical Info">
<CheckboxGroup
            label="Symptoms"
            options={SYMPTOM_OPTIONS}
            selected={symptomsSelected}
            onSelect={(v) => {
              setSymptomsSelected(v);
              updateField("symptoms", v.join(", "));
            }}
          />
          <TextInputField
            label="Temperature (°C)"
            value={formData.temperature}
            onChangeText={(v) => updateField("temperature", v)}
            placeholder="Optional (30-45°C)"
            keyboardType="numeric"
            error={errors.temperature}
          />
          <TextInputField
            label="Illness Duration (Days)"
            value={formData.illnessDurationDays}
            onChangeText={(v) => updateField("illnessDurationDays", v)}
            placeholder="Optional"
            keyboardType="numeric"
          />
        </FormSection>

        <FormSection title="Test & Diagnosis">
          <RadioGroup
            label="Test Type *"
            options={TEST_TYPE_OPTIONS}
            selected={formData.testType}
            onSelect={(v) => updateField("testType", v)}
            error={errors.testType}
          />
          {(formData.testType === "RDT" || formData.testType === "Both") && (
            <RadioGroup
              label="RDT Result"
              options={RESULT_OPTIONS}
              selected={formData.rdtResult}
              onSelect={(v) => updateField("rdtResult", v)}
              error={errors.rdtResult}
            />
          )}
          {(formData.testType === "Microscopy" || formData.testType === "Both") && (
            <RadioGroup
              label="Microscopy Result"
              options={RESULT_OPTIONS}
              selected={formData.microscopyResult}
              onSelect={(v) => updateField("microscopyResult", v)}
              error={errors.microscopyResult}
            />
          )}
          {showParasiteSpecies && (
            <Dropdown
              label="Parasite Species"
              options={SPECIES_OPTIONS}
              selected={formData.parasiteSpecies ?? ""}
              onSelect={(v) => updateField("parasiteSpecies", v)}
              placeholder="Select species"
            />
          )}
          <TextInputField
            label="Parasite Density"
            value={formData.parasiteDensity ?? ""}
            onChangeText={(v) => updateField("parasiteDensity", v || null)}
            placeholder="Optional (parasites/μL)"
          />
        </FormSection>

        <FormSection title="Treatment">
          <RadioGroup
            label="Diagnosis Confirmed"
            options={["Yes", "No"]}
            selected={formData.diagnosisConfirmed === 1 ? "Yes" : "No"}
            onSelect={(v) => updateField("diagnosisConfirmed", v === "Yes" ? 1 : 0)}
          />
          <Dropdown
            label="Treatment Given *"
            options={TREATMENT_OPTIONS}
            selected={formData.treatmentGiven}
            onSelect={(v) => updateField("treatmentGiven", v)}
            error={errors.treatmentGiven}
          />
          <TextInputField
            label="Dosage Notes"
            value={formData.dosageNotes ?? ""}
            onChangeText={(v) => updateField("dosageNotes", v || null)}
            placeholder="Optional"
            multiline
            numberOfLines={3}
          />
          <RadioGroup
            label="Referred to Hospital"
            options={["Yes", "No"]}
            selected={formData.referredToHospital === 1 ? "Yes" : "No"}
            onSelect={(v) => updateField("referredToHospital", v === "Yes" ? 1 : 0)}
          />
        </FormSection>

        <FormSection title="Follow-up">
          <RadioGroup
            label="Follow-up Required"
            options={["Yes", "No"]}
            selected={formData.followUpRequired === 1 ? "Yes" : "No"}
            onSelect={(v) => updateField("followUpRequired", v === "Yes" ? 1 : 0)}
          />
          {formData.followUpRequired === 1 && (
            <TextInputField
              label="Follow-up Date"
              value={formData.followUpDate}
              onChangeText={(v) => updateField("followUpDate", v)}
              placeholder="YYYY-MM-DD"
            />
          )}
        </FormSection>

        <View style={styles.buttonContainer}>
          <Button
            title="Save as Draft"
            variant="secondary"
            onPress={() => handleSave("draft")}
            style={styles.draftButton}
          />
          <Button
            title="Submit Case"
            onPress={() => handleSave("submitted")}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  draftButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});