import { MalariaCase } from "../types/case";

const API_URL = "https://healthbox-production.up.railway.app";

export interface SyncResponse {
  syncedIds: string[];
  failedIds: string[];
}

export interface SyncError extends Error {
  isNetworkError?: boolean;
}

export async function syncCasesToServer(
  cases: MalariaCase[],
  accessToken: string
): Promise<SyncResponse> {
  try {
    const response = await fetch(`${API_URL}/api/sync/cases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(cases),
    });

    if (response.ok === false) {
      const errorData = await response.json();
      throw new Error(errorData.error ?? "Failed to sync cases") as SyncError;
    }

    const data = (await response.json()) as SyncResponse;
    return data;
  } catch (error) {
    const syncError = error as SyncError;
    if (syncError.name === "TypeError") {
      syncError.isNetworkError = true;
    }
    throw syncError;
  }
}