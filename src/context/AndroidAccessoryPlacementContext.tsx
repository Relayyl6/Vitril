// context/AndroidAccessoryPlacementContext.tsx
import { createContext } from "react";

export const AndroidAccessoryPlacementContext = createContext<"regular" | "inline">("regular");