import React from "react";
import { Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScreenContainer } from "../components/ScreenContainer";
import { Button } from "../components/Button";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { useAuth } from "../context/AuthContext";
import { resetDatabase } from "../database/db";

type Props = NativeStackScreenProps<any, "Home">;

export const HomeScreen: React.FC<Props> = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleResetDatabase = async () => {
    try {
      await resetDatabase();
      Alert.alert("Database Reset", "Database has been reset successfully.");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      }
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.welcomeText}>
        Welcome{currentUser?.fullName ? `, ${currentUser.fullName}` : ""}
      </Text>
      <Button
        title="Log Out"
        variant="secondary"
        onPress={handleLogout}
        style={styles.logoutButton}
      />
      <TouchableOpacity onPress={handleResetDatabase}>
        <Text style={styles.devButton}>Dev: Reset Database</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  welcomeText: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold as any,
    color: colors.textPrimary,
    marginBottom: 24,
  },
  logoutButton: {
    marginTop: 12,
  },
  devButton: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    marginTop: 24,
    textAlign: "center",
  },
});