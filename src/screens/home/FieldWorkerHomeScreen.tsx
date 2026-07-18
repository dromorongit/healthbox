import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { ScreenContainer } from "../../components/ScreenContainer";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  getFieldWorkerOverview,
  FieldWorkerOverview,
  NetworkError,
  AuthInvalidError,
  isAuthInvalidError,
} from "../../api/client";

interface RecentCase {
  id: string;
  patientFullName: string;
  visitDate: string;
}

export const FieldWorkerHomeScreen: React.FC<any> = ({ navigation }) => {
  const { currentUser, accessToken, logout, handleInvalidSession } = useAuth();
  const [overview, setOverview] = useState<FieldWorkerOverview | null>(null);
  const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    if (accessToken === null || accessToken === undefined) {
      setLoading(false);
      setError("Please log in to view your overview");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getFieldWorkerOverview(accessToken);
      setOverview(data);
      setRecentCases([]);
    } catch (err) {
      if (isAuthInvalidError(err as Error)) {
        await handleInvalidSession();
        return;
      }
      const error = err as NetworkError;
      if (error.isNetworkError === true) {
        setError("Connect to the internet to view your overview");
      } else {
        setError(error.message ?? "Failed to load overview");
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      loadOverview();
    }, [loadOverview])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOverview();
    setRefreshing(false);
  };

  const handleCasePress = () => {
    navigation.navigate("CaseList" as never);
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
        </View>
      </ScreenContainer>
    );
  }

  if (error !== null) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (overview === null || overview.totalCases === 0) {
    return (
      <ScreenContainer>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hello{currentUser?.fullName ? `, ${currentUser.fullName}` : ""}
          </Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No cases yet — tap the Cases tab to add your first one
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hello{currentUser?.fullName ? `, ${currentUser.fullName}` : ""}
        </Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.totalCasesCard}>
          <Text style={styles.totalCasesValue}>{overview.totalCases}</Text>
          <Text style={styles.totalCasesLabel}>Total Cases Added</Text>
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.statusChip, { backgroundColor: colors.accentGold + "20" }]}>
            <Text style={styles.statusChipValue}>{overview.draftCount}</Text>
            <Text style={styles.statusChipLabel}>Draft</Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: colors.primaryBlue + "20" }]}>
            <Text style={styles.statusChipValue}>{overview.submittedCount}</Text>
            <Text style={styles.statusChipLabel}>Submitted</Text>
          </View>
        </View>

<View style={styles.resultSection}>
           <Text style={styles.sectionTitle}>Test Results Breakdown</Text>
           <View style={styles.resultGrid}>
             <View style={[styles.resultCard, { backgroundColor: colors.accentGold + "20" }]}>
               <Text style={styles.resultCardValue}>{overview.rdtPositive}</Text>
               <Text style={styles.resultCardLabel}>RDT Positive</Text>
             </View>
             <View style={[styles.resultCard, { backgroundColor: colors.accentGold + "10" }]}>
               <Text style={styles.resultCardValue}>{overview.rdtNegative}</Text>
               <Text style={styles.resultCardLabel}>RDT Negative</Text>
             </View>
             <View style={[styles.resultCard, { backgroundColor: colors.primaryBlue + "20" }]}>
               <Text style={styles.resultCardValue}>{overview.microscopyPositive}</Text>
               <Text style={styles.resultCardLabel}>Microscopy Positive</Text>
             </View>
             <View style={[styles.resultCard, { backgroundColor: colors.primaryBlue + "10" }]}>
               <Text style={styles.resultCardValue}>{overview.microscopyNegative}</Text>
               <Text style={styles.resultCardLabel}>Microscopy Negative</Text>
             </View>
           </View>
         </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: typography.sizes.body,
    color: colors.error,
    textAlign: "center",
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold as any,
    color: colors.textPrimary,
  },
  logoutButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  statsContainer: {
    gap: 16,
  },
  totalCasesCard: {
    backgroundColor: colors.accentGold,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  totalCasesValue: {
    fontSize: typography.sizes.h1,
    fontWeight: typography.weights.bold as any,
    color: colors.background,
  },
  totalCasesLabel: {
    fontSize: typography.sizes.body,
    color: colors.background,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: "row",
    gap: 12,
  },
  statusChip: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statusChipValue: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.bold as any,
    color: colors.textPrimary,
  },
  statusChipLabel: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  resultSection: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.medium as any,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  resultGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
  },
  resultCard: {
    width: "48%",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  resultCardValue: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.bold as any,
    color: colors.textPrimary,
  },
  resultCardLabel: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  recentSection: {
    marginTop: 24,
  },
  recentList: {
    maxHeight: 200,
  },
  caseItem: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  caseName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium as any,
    color: colors.textPrimary,
  },
  caseDate: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
  },
});