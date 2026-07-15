import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

interface CheckboxGroupProps {
  label: string;
  options: string[];
  selected: string[];
  onSelect: (values: string[]) => void;
  error?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  options,
  selected,
  onSelect,
  error,
}) => {
  const toggleOption = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter((s) => s !== option)
      : [...selected, option];
    onSelect(newSelected);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <TouchableOpacity
              key={option}
              onPress={() => toggleOption(option)}
              style={[styles.option, isSelected && styles.selectedOption]}
            >
              <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  optionText: {
    fontSize: typography.sizes.body,
    color: colors.textPrimary,
  },
  selectedOptionText: {
    color: colors.background,
  },
  errorText: {
    fontSize: typography.sizes.caption,
    color: colors.error,
    marginTop: 4,
  },
});