import React, { useState } from "react";
import { Text, StyleSheet, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScreenContainer } from "../components/ScreenContainer";
import { TextInputField } from "../components/TextInputField";
import { Button } from "../components/Button";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { useAuth } from "../context/AuthContext";

type Props = NativeStackScreenProps<any, "Login">;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await login(phoneNumber, password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.logo}>DhreamBox</Text>
      <TextInputField
        label="Phone Number"
        placeholder="Enter your phone number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      <TextInputField
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Button title="Log In" onPress={handleLogin} loading={loading} />
      <Button
        title="New here? Register"
        variant="secondary"
        onPress={() => navigation.navigate("Register")}
        style={styles.registerButton}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  logo: {
    fontSize: typography.sizes.h1,
    fontWeight: typography.weights.bold as any,
    color: colors.accentGold,
    textAlign: "center",
    marginBottom: 32,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.caption,
    marginBottom: 16,
    textAlign: "center",
  },
  registerButton: {
    marginTop: 12,
  },
});