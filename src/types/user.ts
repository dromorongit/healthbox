export type Role = "field_worker" | "team_leader" | "supervisor";

export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  passwordHash: string;
  facility: string;
  role: Role;
  createdAt: string;
  syncStatus?: "unsynced" | "syncing" | "synced" | "sync_failed";
  serverUserId?: string | null;
}

export interface RegisterUserData {
  fullName: string;
  phoneNumber: string;
  facility: string;
  password: string;
  role: Role;
}

export interface AuthContextType {
  currentUser: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  register: (userData: RegisterUserData) => Promise<void>;
  logout: () => Promise<void>;
  handleInvalidSession: () => Promise<void>;
}