import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, children, icon }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {icon}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.medium as any,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  content: {},
});