import { useEffect, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import { runSync, canSync } from "../sync/syncManager";

export function useAutoSync(accessToken: string | null): void {
  const previousConnected = useRef<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isNowConnected = state.isConnected === true;
      const wasConnected = previousConnected.current;

      if (wasConnected === false && isNowConnected === true) {
        if (accessToken !== null && accessToken !== undefined) {
          if (canSync()) {
            runSync(accessToken);
          }
        }
      }

      previousConnected.current = isNowConnected;
    });

    return () => {
      unsubscribe();
    };
  }, [accessToken]);
}