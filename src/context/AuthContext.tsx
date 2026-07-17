import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContextType, User, RegisterUserData } from "../types/user";
import { createUser, findUserById, verifyPassword, updateUserSyncStatus, updateUserServerId } from "../database/userRepository";
import { registerUserOnServer, loginUserOnServer, ApiError } from "../api/client";
import * as Crypto from "expo-crypto";
import NetInfo from "@react-native-community/netinfo";

const SESSION_KEY = "currentUser_id";
const TOKEN_KEY = "accessToken";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem(SESSION_KEY);
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        if (storedUserId) {
          const user = await findUserById(storedUserId);
          setCurrentUser(user ?? null);
        }
        setAccessToken(storedToken);
      } catch (error) {
        console.error("Failed to restore session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (phoneNumber: string, password: string): Promise<void> => {
    try {
      const user = await verifyPassword(phoneNumber, password);
      setCurrentUser(user);
      await AsyncStorage.setItem(SESSION_KEY, user.id);

      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected === true) {
        const syncStatus = user.syncStatus ?? "synced";
        if (syncStatus === "unsynced") {
          try {
            await registerUserOnServer({
              fullName: user.fullName,
              phoneNumber: user.phoneNumber,
              facility: user.facility,
              password: password,
              role: user.role,
            });
            await updateUserSyncStatus(user.id, "synced");
          } catch (syncError) {
            const apiError = syncError as ApiError;
            if (apiError.isAlreadyRegistered === true) {
              await updateUserSyncStatus(user.id, "synced");
            } else {
              await updateUserSyncStatus(user.id, "sync_failed");
            }
          }
        }

        try {
          const authResponse = await loginUserOnServer(phoneNumber, password);
          if (authResponse.accessToken !== undefined && authResponse.accessToken !== null) {
            setAccessToken(authResponse.accessToken);
            await AsyncStorage.setItem(TOKEN_KEY, authResponse.accessToken);
          }
        } catch (apiError) {
          const error = apiError as ApiError;
          if (error.isNetworkError !== true) {
            console.error("Background token refresh failed:", error.message);
          }
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterUserData): Promise<void> => {
    try {
      const passwordHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        userData.password
      );
      const userId = Crypto.randomUUID();
      const user: User = {
        id: userId,
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber,
        passwordHash,
        facility: userData.facility,
        role: userData.role,
        createdAt: new Date().toISOString(),
        syncStatus: "unsynced",
        serverUserId: null,
      };
      await createUser(user);
      setCurrentUser(user);
      await AsyncStorage.setItem(SESSION_KEY, user.id);

      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected === true) {
        try {
          const authResponse = await registerUserOnServer(userData);
          if (authResponse.accessToken !== undefined && authResponse.accessToken !== null) {
            setAccessToken(authResponse.accessToken);
            await AsyncStorage.setItem(TOKEN_KEY, authResponse.accessToken);
          }
          if (authResponse.user?.id !== undefined && authResponse.user.id !== null) {
            await updateUserServerId(user.id, authResponse.user.id);
          }
        } catch (apiError) {
          const error = apiError as ApiError;
          if (error.isAlreadyRegistered === true) {
            throw new Error("This phone number is already registered. Please log in instead.");
          }
          await updateUserSyncStatus(user.id, "sync_failed");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to register user");
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setCurrentUser(null);
      setAccessToken(null);
      await AsyncStorage.removeItem(SESSION_KEY);
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const value: AuthContextType = {
    currentUser,
    accessToken,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}