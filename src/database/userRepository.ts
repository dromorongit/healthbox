import { getDb } from "./db";
import * as Crypto from "expo-crypto";
import { User } from "../types/user";

export async function hashPassword(password: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  return digest;
}

export async function createUser(user: User): Promise<void> {
  try {
    const db = getDb();
    const stmt = db.prepareSync(
      "INSERT INTO users (id, fullName, phoneNumber, passwordHash, facility, role, createdAt, syncStatus, serverUserId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    stmt.executeSync([
      user.id,
      user.fullName,
      user.phoneNumber,
      user.passwordHash,
      user.facility,
      user.role,
      user.createdAt,
      "unsynced",
      user.serverUserId ?? null,
    ]);
    stmt.finalizeSync();
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      throw new Error("Phone number already registered");
    }
    throw new Error("Failed to create user");
  }
}

export async function findUserByPhone(phoneNumber: string): Promise<User | null> {
  try {
    const normalizedPhone = phoneNumber.replace(/\D/g, "");
    const db = getDb();
    const result = db.getAllSync<User>("SELECT * FROM users", []);
    const user = result.find(u => (u.phoneNumber ?? "").replace(/\D/g, "") === normalizedPhone);
    if (user === undefined) {
      return null;
    }
    return user;
  } catch (error) {
    throw new Error("Failed to find user");
  }
}

export async function findUserById(id: string): Promise<User | null> {
  try {
    const db = getDb();
    const result = db.getAllSync<User>("SELECT * FROM users WHERE id = ?", [id]);
    if (result.length === 0) {
      return null;
    }
    return result[0];
  } catch (error) {
    throw new Error("Failed to find user");
  }
}

export async function verifyPassword(
  phoneNumber: string,
  password: string
): Promise<User> {
  try {
    const user = await findUserByPhone(phoneNumber);
    if (user === null) {
      throw new Error("Invalid phone number or password");
    }
    const passwordHash = await hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      throw new Error("Invalid phone number or password");
    }
    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to verify password");
  }
}

export async function updateUserSyncStatus(
  id: string,
  syncStatus: "unsynced" | "syncing" | "synced" | "sync_failed"
): Promise<void> {
  try {
    const db = getDb();
    db.runSync("UPDATE users SET syncStatus = ? WHERE id = ?", [syncStatus, id]);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update user sync status: ${error.message}`);
    }
    throw new Error("Failed to update user sync status");
  }
}

export async function updateUserServerId(
  localId: string,
  serverUserId: string
): Promise<void> {
  try {
    const db = getDb();
    db.runSync("UPDATE users SET serverUserId = ?, syncStatus = ? WHERE id = ?", [serverUserId, "synced", localId]);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update user server id: ${error.message}`);
    }
    throw new Error("Failed to update user server id");
  }
}