// hooks/useBottomAccessoryPlacement.ts
import { Platform } from "react-native";
import { useContext } from "react";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { AndroidAccessoryPlacementContext } from "@/context/AndroidAccessoryPlacementContext";

export function useBottomAccessoryPlacement(): "regular" | "inline" {
  if (Platform.OS === "ios") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return NativeTabs.BottomAccessory.usePlacement();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useContext(AndroidAccessoryPlacementContext);
}