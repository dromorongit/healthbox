import React, { useState } from "react";
import { Text, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScreenContainer } from "../components/ScreenContainer";
import { TextInputField } from "../components/TextInputField";
import { Button } from "../components/Button";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { useAuth } from "../context/AuthContext";
import { RegisterUserData } from "../types/user";

type Props = NativeStackScreenProps<any, "Register">;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [facility, setFacility] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [role, setRole] = useState<"field_worker" | "supervisor">("field_worker");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const { register } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }
    if (!facility.trim()) {
      newErrors.facility = "Facility name is required";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const userData: RegisterUserData = {
        fullName,
        phoneNumber,
        facility,
        password,
        role,
      };
      await register(userData);
      navigation.navigate("Home" as never);
    } catch (err) {
      if (err instanceof Error) {
        setErrors({ submit: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Create Account</Text>
      <TextInputField
        label="Full Name"
        placeholder="Enter your full name"
        value={fullName}
        onChangeText={setFullName}
        autoComplete="name"
      />
      <TextInputField
        label="Phone Number"
        placeholder="Enter your phone number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      <TextInputField
        label="Facility Name"
        placeholder="Enter facility name"
        value={facility}
        onChangeText={setFacility}
      />
      <TextInputField
        label="Password"
        placeholder="Enter password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
      />
      <TextInputField
        label="Confirm Password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoComplete="new-password"
      />
      
      <Text style={styles.roleLabel}>Role</Text>
      <View style={styles.roleContainer}>
        <Button
          title="Field Worker"
          variant={role === "field_worker" ? "primary" : "secondary"}
          onPress={() => setRole("field_worker")}
          style={styles.roleButton}
        />
        <Button
          title="Supervisor"
          variant={role === "supervisor" ? "primary" : "secondary"}
          onPress={() => setRole("supervisor")}
          style={styles.roleButton}
        />
      </View>

      {errors.submit ? <Text style={styles.errorText}>{errors.submit}</Text> : null}
      <Button title="Register" onPress={handleRegister} loading={loading} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold as any,
    color: colors.textPrimary,
    marginBottom: 24,
    textAlign: "center",
  },
  roleLabel: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.medium as any,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.caption,
    marginBottom: 16,
    textAlign: "center",
  },
});