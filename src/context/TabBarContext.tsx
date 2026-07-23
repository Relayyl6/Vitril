// context/TabBarContext.tsx
import { createContext } from "react";
import type { AccessoryState } from "@/components/MiniAccessory";

export const TabBarContext = createContext<{
  setIsTabBarHidden: (hidden: boolean) => void;
  setAccessoryState: (state: AccessoryState) => void;
}>({
  setIsTabBarHidden: () => {},
  setAccessoryState: () => {},
});