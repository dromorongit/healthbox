import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { AuthNavigator } from "./src/navigation/AuthNavigator";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { SplashScreen } from "./src/screens/SplashScreen";
import { initDb } from "./src/database/db";

initDb();

function AppContent() {
  const { currentUser, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return currentUser ? <AppNavigator /> : <AuthNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppContent />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}