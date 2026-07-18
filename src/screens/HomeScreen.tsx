import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { FieldWorkerHomeScreen } from "./home/FieldWorkerHomeScreen";
import { TeamLeaderHomeScreen } from "./home/TeamLeaderHomeScreen";
import { SupervisorHomeScreen } from "./home/SupervisorHomeScreen";
import { Role } from "../types/user";

type Props = NativeStackScreenProps<any, "Home">;

export const HomeScreen: React.FC<Props> = (props) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role ?? "field_worker";

  if (role === "field_worker") {
    return <FieldWorkerHomeScreen {...props} />;
  }
  if (role === "team_leader") {
    return <TeamLeaderHomeScreen {...props} />;
  }
  if (role === "supervisor") {
    return <SupervisorHomeScreen {...props} />;
  }

  return null;
};