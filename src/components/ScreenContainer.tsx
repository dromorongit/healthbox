import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: any;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
});