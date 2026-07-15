import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

interface TextInputFieldProps {
  label: string;
  error?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoComplete?: any;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  error,
  editable = true,
  multiline = false,
  ...props
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={[
          styles.input,
          error ? styles.inputError : null,
          multiline ? styles.multilineInput : null,
        ]}
        placeholderTextColor={colors.textSecondary}
        editable={editable}
        multiline={multiline}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.medium as any,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: typography.sizes.body,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: typography.sizes.caption,
    color: colors.error,
    marginTop: 4,
  },
});