import {
  getCasesNeedingSync,
  setSyncStatus,
  getAllCases,
} from "../database/caseRepository";
import { syncCasesToServer } from "../api/client";

let lastSyncAttempt: number = 0;
const SYNC_DEBOUNCE_MS = 10000;

export function canSync(): boolean {
  const now = Date.now();
  return now - lastSyncAttempt >= SYNC_DEBOUNCE_MS;
}

export async function runSync(accessToken: string | null): Promise<void> {
  if (canSync() === false) {
    console.log("Sync debounced - skipping");
    return;
  }

  lastSyncAttempt = Date.now();

  let authToken = accessToken;

  try {
    const cases = await getCasesNeedingSync();

    if (cases.length === 0) {
      return;
    }

    if (authToken === null) {
      authToken = await getStoredToken();
    }

    if (authToken === null) {
      console.log("No access token available for sync");
      return;
    }

    for (const malariaCase of cases) {
      await setSyncStatus(malariaCase.id, "syncing");
    }

    const response = await syncCasesToServer(cases, authToken);

    for (const id of response.syncedIds) {
      await setSyncStatus(id, "synced");
    }

    for (const id of response.failedIds) {
      await setSyncStatus(id, "sync_failed");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown sync error";
    console.error("Sync failed, marking syncing cases as failed:", errorMessage);

    const allCases = await getAllCases();
    const syncingCases = allCases.filter((c) => c.syncStatus === "syncing");
    for (const malariaCase of syncingCases) {
      await setSyncStatus(malariaCase.id, "sync_failed");
    }
  }
}

const TOKEN_KEY = "accessToken";

async function getStoredToken(): Promise<string | null> {
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}