import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { ScreenContainer } from "../../components/ScreenContainer";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  getTeamLeaderOverview,
  getMyTeam,
  createTeam,
  searchFieldWorkerByPhone,
  addTeamMember,
  removeTeamMember,
  Team,
  TeamLeaderOverview,
  NetworkError,
  isAuthInvalidError,
  NoTeamError,
  isNoTeamError,
} from "../../api/client";

export const TeamLeaderHomeScreen: React.FC<any> = () => {
  const { currentUser, accessToken, logout, handleInvalidSession } = useAuth();
  const [overview, setOverview] = useState<TeamLeaderOverview | null>(null);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [searchResult, setSearchResult] = useState<{ id: string; fullName: string; phoneNumber: string } | null>(null);
  const [searching, setSearching] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  const loadOverview = useCallback(async () => {
    if (accessToken === null || accessToken === undefined) {
      setLoading(false);
      setError("Please log in to view your overview");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const teamData = await getMyTeam(accessToken);
      setMyTeam(teamData);

      if (teamData === null) {
        setOverview(null);
        return;
      }

      try {
        const overviewData = await getTeamLeaderOverview(accessToken);
        setOverview(overviewData);
      } catch (overviewErr) {
        if (isNoTeamError(overviewErr as Error)) {
          setOverview(null);
        } else if (isAuthInvalidError(overviewErr as Error)) {
          await handleInvalidSession();
          return;
        } else {
          throw overviewErr;
        }
      }
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

  const handleCreateTeam = async () => {
    if (teamName.trim() === "") {
      return;
    }
    if (accessToken === null || accessToken === undefined) {
      return;
    }

    setCreatingTeam(true);
    try {
      await createTeam(teamName.trim(), accessToken);
      setTeamName("");
      await loadOverview();
    } catch (err) {
      if (isAuthInvalidError(err as Error)) {
        await handleInvalidSession();
        return;
      }
      if (err instanceof Error) {
        Alert.alert("Error", err.message);
      }
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleSearch = async () => {
    if (phoneSearch.trim() === "") {
      return;
    }
    if (accessToken === null || accessToken === undefined) {
      return;
    }

    setSearching(true);
    setSearchResult(null);
    try {
      const result = await searchFieldWorkerByPhone(phoneSearch.trim(), accessToken);
      setSearchResult(result);
    } catch (err) {
      if (isAuthInvalidError(err as Error)) {
        await handleInvalidSession();
        return;
      }
      if (err instanceof Error) {
        Alert.alert("Search Error", err.message);
      }
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = async () => {
    if (searchResult === null || myTeam === null || accessToken === null || accessToken === undefined) {
      return;
    }

    setAddingMember(true);
    try {
      await addTeamMember(myTeam.id, searchResult.id, accessToken);
      setPhoneSearch("");
      setSearchResult(null);
      setShowAddMember(false);
      await loadOverview();
    } catch (err) {
      if (isAuthInvalidError(err as Error)) {
        await handleInvalidSession();
        return;
      }
      if (err instanceof Error) {
        Alert.alert("Error", err.message);
      }
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (myTeam === null) {
      return;
    }

    Alert.alert(
      "Remove Member",
      `Remove ${memberName} from the team?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            if (accessToken === null || accessToken === undefined) {
              return;
            }
            try {
              await removeTeamMember(myTeam.id, memberId, accessToken);
              await loadOverview();
            } catch (err) {
              if (isAuthInvalidError(err as Error)) {
                await handleInvalidSession();
                return;
              }
              if (err instanceof Error) {
                Alert.alert("Error", err.message);
              }
            }
          },
        },
      ]
    );
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

  if (myTeam === null) {
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
        <View style={styles.createTeamContainer}>
          <Text style={styles.createTeamTitle}>Create Your Team</Text>
          <Text style={styles.createTeamSubtitle}>
            You haven't created a team yet. Enter a name to get started.
          </Text>
          <TextInput
            style={styles.teamNameInput}
            placeholder="Team name"
            value={teamName}
            onChangeText={setTeamName}
          />
          <TouchableOpacity
            style={[styles.createButton, creatingTeam && styles.disabledButton]}
            onPress={handleCreateTeam}
            disabled={creatingTeam}
          >
            {creatingTeam ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.createButtonText}>Create Team</Text>
            )}
          </TouchableOpacity>
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

      <Text style={styles.teamName}>{myTeam.name}</Text>

      {overview !== null ? (
        <View style={styles.statsContainer}>
          <View style={styles.totalCasesCard}>
            <Text style={styles.totalCasesValue}>{overview.team.totalCases}</Text>
            <Text style={styles.totalCasesLabel}>Team Total Cases</Text>
          </View>

          <View style={styles.statusRow}>
            <View style={[styles.statusChip, { backgroundColor: colors.accentGold + "20" }]}>
              <Text style={styles.statusChipValue}>{overview.personal.totalCases}</Text>
              <Text style={styles.statusChipLabel}>Your Cases</Text>
            </View>
            <View style={[styles.statusChip, { backgroundColor: colors.primaryBlue + "20" }]}>
              <Text style={styles.statusChipValue}>{overview.team.members.length}</Text>
              <Text style={styles.statusChipLabel}>Team Members</Text>
            </View>
          </View>

          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>Test Results</Text>
            <View style={styles.resultRow}>
              <View style={styles.resultColumn}>
                <Text style={styles.resultValue}>{overview.team.rdtPositive + overview.team.rdtNegative}</Text>
                <Text style={styles.resultLabel}>RDT Total</Text>
              </View>
              <View style={styles.resultColumn}>
                <Text style={styles.resultValue}>{overview.team.microscopyPositive + overview.team.microscopyNegative}</Text>
                <Text style={styles.resultLabel}>Microscopy Total</Text>
              </View>
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.membersSection}>
        <View style={styles.membersHeader}>
          <Text style={styles.sectionTitle}>Team Members</Text>
          <TouchableOpacity onPress={() => setShowAddMember(true)} style={styles.addButton}>
            <Ionicons name="add" size={24} color={colors.primaryBlue} />
          </TouchableOpacity>
        </View>

{overview !== null && overview.team.members.length === 0 ? (
           <Text style={styles.emptyText}>No members yet. Add your first team member.</Text>
         ) : (
          <FlatList
            data={overview?.team.members ?? []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.memberCard}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{item.fullName}</Text>
                  <Text style={styles.memberCases}>{item.caseCount} cases</Text>
                </View>
                {item.id !== currentUser?.id ? (
                  <TouchableOpacity onPress={() => handleRemoveMember(item.id, item.fullName)}>
                    <Ionicons name="remove-circle" size={24} color={colors.error} />
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            style={styles.membersList}
          />
        )}
      </View>

      {showAddMember ? (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Team Member</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter phone number"
              value={phoneSearch}
              onChangeText={setPhoneSearch}
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>

            {searchResult !== null ? (
              <View style={styles.searchResult}>
                <Text style={styles.searchResultName}>{searchResult.fullName}</Text>
                <TouchableOpacity
                  style={styles.addMemberButton}
                  onPress={handleAddMember}
                  disabled={addingMember}
                >
                  {addingMember ? (
                    <ActivityIndicator color={colors.primaryBlue} />
                  ) : (
                    <Text style={styles.addMemberButtonText}>Add to Team</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : phoneSearch.trim() !== "" && !searching ? (
              <Text style={styles.noResultText}>No field worker found with this phone number</Text>
            ) : null}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowAddMember(false);
                setPhoneSearch("");
                setSearchResult(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
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
  teamName: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.medium as any,
    color: colors.primaryBlue,
    marginBottom: 24,
  },
  createTeamContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  createTeamTitle: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold as any,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  createTeamSubtitle: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  teamNameInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: typography.sizes.body,
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: colors.primaryBlue,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.background,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium as any,
  },
  disabledButton: {
    opacity: 0.5,
  },
  noResultText: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    marginTop: 12,
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
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  resultColumn: {
    alignItems: "center",
  },
  resultValue: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold as any,
    color: colors.textPrimary,
  },
  resultLabel: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
  emptyText: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    textAlign: "center",
    paddingVertical: 24,
  },
  membersSection: {
    marginTop: 24,
    flex: 1,
  },
  membersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addButton: {
    padding: 4,
  },
  membersList: {
    flex: 1,
  },
  memberCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium as any,
    color: colors.textPrimary,
  },
  memberCases: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.bold as any,
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: "center",
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: typography.sizes.body,
    marginBottom: 12,
  },
  searchButton: {
    backgroundColor: colors.primaryBlue,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  searchButtonText: {
    color: colors.background,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium as any,
  },
  searchResult: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  searchResultName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium as any,
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: "center",
  },
  addMemberButton: {
    backgroundColor: colors.primaryBlue + "20",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  addMemberButtonText: {
    color: colors.primaryBlue,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium as any,
  },
  cancelButtonText: {
    color: colors.error,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium as any,
    textAlign: "center",
  },
  cancelButton: {
    marginTop: 12,
    alignItems: "center",
  },
});