import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { ScreenContainer } from "../components/ScreenContainer";
import { Button } from "../components/Button";
import { FormSection } from "../components/FormSection";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { MalariaCase } from "../types/case";
import { AppStackParamList } from "../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";

export function CaseDetailScreen({ route, navigation }: {
  route: RouteProp<AppStackParamList, "CaseDetail">;
  navigation: NativeStackNavigationProp<AppStackParamList>;
}) {
  const caseItem = route.params?.case as MalariaCase;

  useEffect(() => {
    navigation.setOptions({ title: caseItem.patientFullName });
  }, [navigation, caseItem.patientFullName]);

  const handleEdit = () => {
    navigation.navigate("AddCase", { case: caseItem });
  };

  const getSyncIconName = (syncStatus?: MalariaCase["syncStatus"]): keyof typeof Ionicons.glyphMap => {
    if (syncStatus === "synced") return "cloud-done";
    if (syncStatus === "sync_failed") return "cloud-offline";
    return "cloud-outline";
  };

  const getSyncIconColor = (syncStatus?: MalariaCase["syncStatus"]): string => {
    if (syncStatus === "synced") return colors.primaryBlue;
    if (syncStatus === "sync_failed") return colors.error;
    return colors.textSecondary;
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.syncIndicatorRow}>
          <Ionicons 
            name={getSyncIconName(caseItem.syncStatus)} 
            size={20} 
            color={getSyncIconColor(caseItem.syncStatus)} 
          />
        </View>
        <FormSection title="Patient Info">
          <DetailRow label="Full Name" value={caseItem.patientFullName} />
          <DetailRow label="Age" value={String(caseItem.age)} />
          <DetailRow label="Sex" value={caseItem.sex} />
          <DetailRow label="Phone" value={caseItem.phoneNumber ?? "N/A"} />
          <DetailRow label="Community" value={caseItem.community} />
          <DetailRow 
            label="Is Pregnant" 
            value={caseItem.isPregnant === 1 ? "Yes" : caseItem.isPregnant === 0 ? "No" : "N/A"} 
          />
        </FormSection>

        <FormSection title="Visit Info">
          <DetailRow label="Visit Date" value={new Date(caseItem.visitDate).toLocaleDateString()} />
          <DetailRow label="Facility" value={caseItem.facilityName} />
          <DetailRow label="Health Worker" value={caseItem.healthWorkerName} />
        </FormSection>

        <FormSection title="Clinical Info">
          <DetailRow label="Symptoms" value={caseItem.symptoms ?? "None recorded"} />
          <DetailRow label="Temperature" value={caseItem.temperature !== null ? `${caseItem.temperature}°C` : "N/A"} />
          <DetailRow label="Illness Duration" value={caseItem.illnessDurationDays !== null ? `${caseItem.illnessDurationDays} days` : "N/A"} />
        </FormSection>

        <FormSection title="Test & Diagnosis">
          <DetailRow label="Test Type" value={caseItem.testType} />
          <DetailRow label="RDT Result" value={caseItem.rdtResult} />
          <DetailRow label="Microscopy Result" value={caseItem.microscopyResult} />
          <DetailRow label="Parasite Species" value={caseItem.parasiteSpecies ?? "N/A"} />
          <DetailRow label="Parasite Density" value={caseItem.parasiteDensity ?? "N/A"} />
        </FormSection>

        <FormSection title="Treatment">
          <DetailRow label="Diagnosis Confirmed" value={caseItem.diagnosisConfirmed === 1 ? "Yes" : "No"} />
          <DetailRow label="Treatment Given" value={caseItem.treatmentGiven} />
          <DetailRow label="Dosage Notes" value={caseItem.dosageNotes ?? "N/A"} />
          <DetailRow label="Referred" value={caseItem.referredToHospital === 1 ? "Yes" : "No"} />
        </FormSection>

        <FormSection title="Follow-up">
          <DetailRow label="Follow-up Required" value={caseItem.followUpRequired === 1 ? "Yes" : "No"} />
          <DetailRow label="Follow-up Date" value={caseItem.followUpDate ? new Date(caseItem.followUpDate).toLocaleDateString() : "N/A"} />
        </FormSection>

        <Button
          title="Edit"
          onPress={handleEdit}
          disabled={caseItem.status !== "draft"}
          style={styles.editButton}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  syncIndicatorRow: {
    paddingVertical: 16,
    alignItems: "center",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.medium as any,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: typography.sizes.body,
    color: colors.textPrimary,
    flex: 1,
    textAlign: "right",
  },
  editButton: {
    marginTop: 16,
  },
});