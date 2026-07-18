import { MalariaCase } from "../types/case";
import { RegisterUserData, Role } from "../types/user";

const API_URL = "https://healthbox-production.up.railway.app";

export interface SyncResponse {
  syncedIds: string[];
  failedIds: string[];
}

export interface SyncError extends Error {
  isNetworkError?: boolean;
}

export interface AuthInvalidError extends Error {
  type: "auth_invalid";
}

export function createAuthInvalidError(): AuthInvalidError {
  const error = new Error("Invalid token") as AuthInvalidError;
  error.type = "auth_invalid";
  return error;
}

export function isAuthInvalidError(error: Error): error is AuthInvalidError {
  return (error as AuthInvalidError).type === "auth_invalid";
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: {
    id: string;
    fullName: string;
    phoneNumber: string;
    facility: string;
    role: Role;
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
      if (response.status === 401) {
        throw createAuthInvalidError();
      }
      let errorData: { error?: string };
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }
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

export interface Team {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  facility: string;
  memberCount: number;
}

export interface TeamMember {
  id: string;
  fullName: string;
  phoneNumber: string;
  role: Role;
  caseCount: number;
}

export interface FieldWorkerOverview {
  totalCases: number;
  draftCount: number;
  submittedCount: number;
  rdtPositive: number;
  rdtNegative: number;
  microscopyPositive: number;
  microscopyNegative: number;
}

export interface TeamLeaderOverview {
  personal: FieldWorkerOverview;
  team: {
    id: string;
    name: string;
    totalCases: number;
    draftCount: number;
    submittedCount: number;
    rdtPositive: number;
    rdtNegative: number;
    microscopyPositive: number;
    microscopyNegative: number;
    members: TeamMember[];
  };
}

export interface SupervisorOverview {
  facility: string;
  totalCases: number;
  draftCount: number;
  submittedCount: number;
  rdtPositive: number;
  rdtNegative: number;
  microscopyPositive: number;
  microscopyNegative: number;
  teams: {
    id: string;
    name: string;
    leaderName: string;
    memberCount: number;
    caseCount: number;
  }[];
}

export interface NetworkError extends Error {
  isNetworkError: true;
}

function isNetworkError(error: Error): error is NetworkError {
  return error.name === "TypeError" || (error as NetworkError).isNetworkError === true;
}

export async function createTeam(
  name: string,
  accessToken: string
): Promise<Team> {
  try {
    const response = await fetch(`${API_URL}/api/teams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ name }),
    });

    if (response.ok === false) {
      if (response.status === 401) {
        throw createAuthInvalidError();
      }
      let errorData: { error?: string };
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }
      throw new Error(errorData.error ?? "Failed to create team");
    }

    return (await response.json()) as Team;
  } catch (error) {
    const err = error as Error;
    if (isNetworkError(err)) {
      const networkError = new Error("Network error. Please connect to the internet to view your overview.") as NetworkError;
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw err;
  }
}

export async function searchFieldWorkerByPhone(
  phone: string,
  accessToken: string
): Promise<{ id: string; fullName: string; phoneNumber: string } | null> {
  try {
    const response = await fetch(`${API_URL}/api/teams/search?phone=${encodeURIComponent(phone)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (response.ok === false) {
      if (response.status === 401) {
        throw createAuthInvalidError();
      }
      let errorData: { error?: string };
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }
      throw new Error(errorData.error ?? "Search failed");
    }

    return (await response.json()) as { id: string; fullName: string; phoneNumber: string };
  } catch (error) {
    const err = error as Error;
    if (isNetworkError(err)) {
      const networkError = new Error("Network error. Please connect to the internet to view your overview.") as NetworkError;
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw err;
  }
}

export async function addTeamMember(
  teamId: string,
  userId: string,
  accessToken: string
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_URL}/api/teams/${teamId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (response.ok === false) {
      if (response.status === 401) {
        throw createAuthInvalidError();
      }
      let errorData: { error?: string };
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }
      throw new Error(errorData.error ?? "Failed to add team member");
    }

    return (await response.json()) as { success: boolean };
  } catch (error) {
    const err = error as Error;
    if (isNetworkError(err)) {
      const networkError = new Error("Network error. Please connect to the internet to view your overview.") as NetworkError;
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw err;
  }
}

export async function removeTeamMember(
  teamId: string,
  userId: string,
  accessToken: string
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_URL}/api/teams/${teamId}/members/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok === false) {
      if (response.status === 401) {
        throw createAuthInvalidError();
      }
      let errorData: { error?: string };
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }
      throw new Error(errorData.error ?? "Failed to remove team member");
    }

    return (await response.json()) as { success: boolean };
  } catch (error) {
    const err = error as Error;
    if (isNetworkError(err)) {
      const networkError = new Error("Network error. Please connect to the internet to view your overview.") as NetworkError;
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw err;
  }
}

export interface MyTeamResponse {
  hasTeam: false;
}

export interface MyTeamSuccessResponse {
  hasTeam: true;
  team: Team;
}

export async function getMyTeam(accessToken: string): Promise<Team | null> {
  try {
    const response = await fetch(`${API_URL}/api/teams/my-team`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      throw createAuthInvalidError();
    }

    if (response.ok === false && response.status !== 200) {
      let errorData: { error?: string };
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }
      throw new Error(errorData.error ?? "Failed to get team");
    }

    const data = (await response.json()) as MyTeamSuccessResponse | MyTeamResponse;
    
    if (data.hasTeam === false) {
      return null;
    }
    
    return data.team;
  } catch (error) {
    const err = error as Error;
    if (isNetworkError(err)) {
      const networkError = new Error("Network error. Please connect to the internet to view your overview.") as NetworkError;
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw err;
  }
}

export async function getFieldWorkerOverview(accessToken: string): Promise<FieldWorkerOverview> {
  try {
    const response = await fetch(`${API_URL}/api/overview/field-worker`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok === false) {
      if (response.status === 401) {
        throw createAuthInvalidError();
      }
      let errorData: { error?: string };
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }
      throw new Error(errorData.error ?? "Failed to get overview");
    }

    return (await response.json()) as FieldWorkerOverview;
  } catch (error) {
    const err = error as Error;
    if (isNetworkError(err)) {
      const networkError = new Error("Network error. Please connect to the internet to view your overview.") as NetworkError;
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw err;
  }
}

export class NoTeamError extends Error {
  constructor() {
    super("No team found");
    this.name = "NoTeamError";
  }
}

export function isNoTeamError(error: Error): error is NoTeamError {
  return error.name === "NoTeamError";
}

interface TeamLeaderOverviewResponse {
  hasTeam: boolean;
  personalStats?: {
    total: number;
    byStatus: { draft: number; submitted: number };
    byResult: {
      rdt: { positive: number; negative: number };
      microscopy: { positive: number; negative: number };
    };
    recentCases: Array<{
      id: string;
      patientFullName: string;
      visitDate: string;
      rdtResult?: string;
      microscopyResult?: string;
      status: string;
      healthWorkerId: string;
    }>;
  };
  team?: {
    id: string;
    name: string;
    facility: string;
    teamLeader: {
      id: string;
      fullName: string;
      phoneNumber: string;
    };
    memberCount: number;
  };
  members?: Array<{
    id: string;
    fullName: string;
    phoneNumber: string;
    caseCount: number;
  }>;
  teamTotals?: {
    totalCases: number;
    rdtPositive: number;
    rdtNegative: number;
  };
}

export async function getTeamLeaderOverview(accessToken: string): Promise<TeamLeaderOverview> {
  try {
    const response = await fetch(`${API_URL}/api/overview/team-leader`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      throw createAuthInvalidError();
    }

    if (response.ok === false && response.status !== 200) {
      let errorData: { error?: string };
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }
      throw new Error(errorData.error ?? "Failed to get overview") as ApiError;
    }

    const data = (await response.json()) as TeamLeaderOverviewResponse;
    
    if (data.hasTeam === false) {
      throw new NoTeamError();
    }

    return {
      personal: {
        totalCases: data.personalStats?.total ?? 0,
        draftCount: data.personalStats?.byStatus.draft ?? 0,
        submittedCount: data.personalStats?.byStatus.submitted ?? 0,
        rdtPositive: data.personalStats?.byResult.rdt.positive ?? 0,
        rdtNegative: data.personalStats?.byResult.rdt.negative ?? 0,
        microscopyPositive: data.personalStats?.byResult.microscopy.positive ?? 0,
        microscopyNegative: data.personalStats?.byResult.microscopy.negative ?? 0,
      },
      team: {
        id: data.team?.id ?? "",
        name: data.team?.name ?? "",
        totalCases: data.teamTotals?.totalCases ?? 0,
        draftCount: 0,
        submittedCount: 0,
        rdtPositive: data.teamTotals?.rdtPositive ?? 0,
        rdtNegative: data.teamTotals?.rdtNegative ?? 0,
        microscopyPositive: 0,
        microscopyNegative: 0,
        members: data.members ?? [],
      },
    } as TeamLeaderOverview;
  } catch (error) {
    const err = error as Error;
    if (isNetworkError(err)) {
      const networkError = new Error("Network error. Please connect to the internet to view your overview.") as NetworkError;
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw err;
  }
}

export async function getSupervisorOverview(accessToken: string): Promise<SupervisorOverview> {
  try {
    const response = await fetch(`${API_URL}/api/overview/supervisor`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok === false) {
      if (response.status === 401) {
        throw createAuthInvalidError();
      }
      let errorData: { error?: string };
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }
      throw new Error(errorData.error ?? "Failed to get overview");
    }

    return (await response.json()) as SupervisorOverview;
  } catch (error) {
    const err = error as Error;
    if (isNetworkError(err)) {
      const networkError = new Error("Network error. Please connect to the internet to view your overview.") as NetworkError;
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw err;
  }
}