// app/(tabs)/_layout.tsx
import { Platform } from "react-native";
import AndroidTabsLayout from "@/components/AndroidTabsLayout";
import IOSTabsLayout from "@/components/IOSTabsLayout";

export default function TabsLayout() {
  return Platform.OS === "ios" ? <IOSTabsLayout /> : <AndroidTabsLayout />;
}