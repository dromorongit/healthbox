import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { getAllCases, getUnsyncedCount } from "../database/caseRepository";
import { MalariaCase } from "../types/case";
import { runSync } from "../sync/syncManager";
import { useAuth } from "../context/AuthContext";
import { useAutoSync } from "../hooks/useAutoSync";

export const CaseListScreen: React.FC<any> = ({ navigation }) => {
  const [cases, setCases] = useState<MalariaCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const { currentUser, accessToken } = useAuth();

  useAutoSync(accessToken);

  const loadCases = useCallback(async () => {
    try {
      setLoading(true);
      const allCases = await getAllCases();
      setCases(allCases);
    } catch (error) {
      console.error("Failed to load cases:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUnsyncedCount = useCallback(async () => {
    try {
      const count = await getUnsyncedCount();
      setUnsyncedCount(count);
    } catch (error) {
      console.error("Failed to load unsynced count:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCases();
      loadUnsyncedCount();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCases();
    await loadUnsyncedCount();
    setRefreshing(false);
  };

  const handleSyncNow = async () => {
    if (syncing) {
      return;
    }
    setSyncing(true);
    try {
      await runSync(accessToken ?? "dummy-token");
      setLastSynced(new Date().toLocaleTimeString());
      await loadCases();
      await loadUnsyncedCount();
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncing(false);
    }
  };

  const handleAddCase = () => {
    navigation.navigate("AddCase", {});
  };

  const handleCasePress = (caseItem: MalariaCase) => {
    navigation.navigate("CaseDetail", { case: caseItem });
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

  const renderCaseItem = ({ item }: { item: MalariaCase }) => {
    const statusColor = item.status === "draft" 
      ? colors.accentGold 
      : colors.primaryBlue;
    const statusTextColor = item.status === "draft" 
      ? colors.textPrimary 
      : colors.background;

    return (
      <TouchableOpacity 
        style={styles.caseCard} 
        onPress={() => handleCasePress(item)}
      >
        <View style={styles.caseHeader}>
          <Text style={styles.patientName}>{item.patientFullName}</Text>
          <View style={styles.indicatorContainer}>
            <Ionicons 
              name={getSyncIconName(item.syncStatus)} 
              size={16} 
              color={getSyncIconColor(item.syncStatus)} 
            />
            <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
              <Text style={[styles.statusText, { color: statusTextColor }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.visitDate}>
          {new Date(item.visitDate).toLocaleDateString()}
        </Text>
        <Text style={styles.testInfo}>
          {item.testType} - {item.rdtResult || item.microscopyResult}
        </Text>
      </TouchableOpacity>
    );
  };

  if (!loading && cases.length === 0) {
    return (
      <ScreenContainer>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No cases recorded yet — tap + to add your first case
          </Text>
          <TouchableOpacity 
            style={styles.fab}
            onPress={handleAddCase}
          >
            <Ionicons name="add" size={24} color={colors.background} />
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {unsyncedCount > 0 ? (
        <View style={styles.syncBar}>
          <Text style={styles.syncBarText}>
            {unsyncedCount} case{unsyncedCount !== 1 ? "s" : ""} pending sync
          </Text>
          <TouchableOpacity 
            style={styles.syncButton}
            onPress={handleSyncNow}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Text style={styles.syncButtonText}>Sync Now</Text>
            )}
          </TouchableOpacity>
          {lastSynced ? (
            <Text style={styles.lastSyncedText}>Last synced: {lastSynced}</Text>
          ) : null}
        </View>
      ) : (
        lastSynced ? (
          <View style={styles.syncBar}>
            <Ionicons name="checkmark-circle" size={16} color={colors.accentGold} />
            <Text style={styles.lastSyncedText}>All cases synced • Last sync: {lastSynced}</Text>
          </View>
        ) : null
      )}
      <FlatList
        data={cases}
        keyExtractor={(item) => item.id}
        renderItem={renderCaseItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleAddCase}
      >
        <Ionicons name="add" size={24} color={colors.background} />
      </TouchableOpacity>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 80,
  },
  caseCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  caseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  patientName: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.medium as any,
    color: colors.textPrimary,
    flex: 1,
  },
  indicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.medium as any,
  },
  visitDate: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  testInfo: {
    fontSize: typography.sizes.body,
    color: colors.textPrimary,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryBlue,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    paddingHorizontal: 40,
  },
  syncBar: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  syncBarText: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  syncButton: {
    backgroundColor: colors.primaryBlue,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  syncButtonText: {
    fontSize: typography.sizes.caption,
    color: colors.background,
    fontWeight: typography.weights.medium as any,
  },
  lastSyncedText: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
  },
});