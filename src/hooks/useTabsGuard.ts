// app/(tabs)/useTabsGuard.ts
import { useAuth } from "@clerk/expo";

export function useTabsGuard() {
  const { isSignedIn, isLoaded } = useAuth();
  return { isSignedIn, isLoaded };
}