// @ts-nocheck
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContextType, User, RegisterUserData } from "../types/user";
import { createUser, findUserById, verifyPassword } from "../database/userRepository";
import * as Crypto from "expo-crypto";

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
      };
      await createUser(user);
      setCurrentUser(user);
      await AsyncStorage.setItem(SESSION_KEY, user.id);
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