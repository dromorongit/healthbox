export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  passwordHash: string;
  facility: string;
  role: "field_worker" | "supervisor";
  createdAt: string;
}

export interface RegisterUserData {
  fullName: string;
  phoneNumber: string;
  facility: string;
  password: string;
  role: "field_worker" | "supervisor";
}

export interface AuthContextType {
  currentUser: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  register: (userData: RegisterUserData) => Promise<void>;
  logout: () => Promise<void>;
}