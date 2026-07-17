// @ts-nocheck
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/HomeScreen";
import { CaseListScreen } from "../screens/CaseListScreen";
import { AddCaseScreen } from "../screens/AddCaseScreen";
import { CaseDetailScreen } from "../screens/CaseDetailScreen";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { MalariaCase } from "../types/case";

export type AppTabParamList = {
  Home: undefined;
  Cases: undefined;
};

export type AppStackParamList = {
  CaseList: undefined;
  AddCase: { case?: MalariaCase };
  CaseDetail: { case: MalariaCase };
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const CasesStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="CaseList" component={CaseListScreen} options={{ title: "Cases" }} />
    <Stack.Screen name="AddCase" component={AddCaseScreen} options={{ title: "Add Case" }} />
    <Stack.Screen name="CaseDetail" component={CaseDetailScreen} options={{ title: "Case Details" }} />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primaryBlue,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: typography.sizes.caption,
          fontWeight: typography.weights.medium as any,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cases"
        component={CasesStack}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="clipboard" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};