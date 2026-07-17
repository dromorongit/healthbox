import { MalariaCase } from "../types/case";
import { RegisterUserData } from "../types/user";

const API_URL = "https://healthbox-production.up.railway.app";

export interface SyncResponse {
  syncedIds: string[];
  failedIds: string[];
}

export interface SyncError extends Error {
  isNetworkError?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: {
    id: string;
    fullName: string;
    phoneNumber: string;
    facility: string;
    role: "field_worker" | "supervisor";
  };
}

export interface ApiError extends Error {
  isNetworkError?: boolean;
  isAlreadyRegistered?: boolean;
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

export async function registerUserOnServer(
  userData: RegisterUserData
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (response.ok === false) {
      const errorData = await response.json();
      const error = new Error(
        errorData.error ?? "Registration failed"
      ) as ApiError;
      if (errorData.error?.includes("already registered") ?? false) {
        error.isAlreadyRegistered = true;
      }
      throw error;
    }

    const data = (await response.json()) as AuthResponse;
    return data;
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.name === "TypeError") {
      apiError.isNetworkError = true;
    }
    throw apiError;
  }
}

export async function loginUserOnServer(
  phoneNumber: string,
  password: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber, password }),
    });

    if (response.ok === false) {
      const errorData = await response.json();
      throw new Error(errorData.error ?? "Login failed") as ApiError;
    }

    const data = (await response.json()) as AuthResponse;
    return data;
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.name === "TypeError") {
      apiError.isNetworkError = true;
    }
    throw apiError;
  }
}