import React from "react";
import { View, StyleSheet, Image, ActivityIndicator } from "react-native";
import { colors } from "../theme/colors";

export const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/healthboxlogo.jpg")}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color={colors.primaryBlue} style={styles.spinner} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 200,
    height: undefined,
    aspectRatio: 1,
  },
  spinner: {
    marginTop: 40,
  },
});