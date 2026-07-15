import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

interface ButtonProps {
  title: string;
  variant?: "primary" | "secondary";
  loading?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  loading = false,
  onPress,
  disabled,
  style,
}) => {
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled ?? loading}
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        (disabled ?? loading) && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.background : colors.primaryBlue} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            isPrimary ? styles.primaryButtonText : styles.secondaryButtonText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: colors.primaryBlue,
  },
  secondaryButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primaryBlue,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium as any,
  },
  primaryButtonText: {
    color: colors.background,
  },
  secondaryButtonText: {
    color: colors.primaryBlue,
  },
});