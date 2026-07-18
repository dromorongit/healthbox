import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { ScreenContainer } from "../../components/ScreenContainer";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  getSupervisorOverview,
  SupervisorOverview,
  NetworkError,
  isAuthInvalidError,
} from "../../api/client";

export const SupervisorHomeScreen: React.FC<any> = () => {
  const { currentUser, accessToken, logout, handleInvalidSession } = useAuth();
  const [overview, setOverview] = useState<SupervisorOverview | null>(null);
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
      const data = await getSupervisorOverview(accessToken);
      setOverview(data);
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

      {overview !== null ? (
        <>
          <Text style={styles.facilityName}>{overview.facility}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.totalCasesCard}>
              <Text style={styles.totalCasesValue}>{overview.totalCases}</Text>
              <Text style={styles.totalCasesLabel}>Facility Total Cases</Text>
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

          <View style={styles.teamsSection}>
            <Text style={styles.sectionTitle}>Teams in Facility</Text>
            {overview.teams.length === 0 ? (
              <Text style={styles.emptyText}>No teams exist yet in this facility.</Text>
) : (
               <FlatList
                 data={overview.teams}
                 keyExtractor={(item) => item.id}
                 renderItem={({ item }) => (
                   <TouchableOpacity style={styles.teamCard}>
                     <View style={styles.teamHeader}>
                       <View style={styles.teamInfo}>
                         <Text style={styles.teamName}>{item.name}</Text>
                         <Text style={styles.teamLeader}>Leader: {item.leaderName}</Text>
                       </View>
                     </View>
                     <View style={styles.teamStatsRow}>
                       <View style={styles.teamStatItem}>
                         <Text style={styles.teamStatValue}>{item.memberCount}</Text>
                         <Text style={styles.teamStatLabel}>Members</Text>
                       </View>
                       <View style={styles.teamStatItem}>
                         <Text style={styles.teamStatValue}>{item.caseCount}</Text>
                         <Text style={styles.teamStatLabel}>Cases</Text>
                       </View>
                     </View>
                   </TouchableOpacity>
                 )}
                 refreshControl={
                   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                 }
               />
             )}
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No overview data available.</Text>
        </View>
      )}
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
    marginBottom: 16,
  },
  greeting: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold as any,
    color: colors.textPrimary,
  },
  logoutButton: {
    padding: 8,
  },
  facilityName: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.medium as any,
    color: colors.primaryBlue,
    marginBottom: 24,
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
    backgroundColor: colors.primaryBlue,
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
  teamsSection: {
    marginTop: 24,
    flex: 1,
  },
  teamCard: {
    flexDirection: "column",
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  teamHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium as any,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  teamLeader: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  teamStatsRow: {
    flexDirection: "row",
    gap: 16,
  },
  teamStatItem: {
    alignItems: "center",
  },
  teamStatValue: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.bold as any,
    color: colors.textPrimary,
  },
  teamStatLabel: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
  },
});