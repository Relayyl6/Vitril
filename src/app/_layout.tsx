import { AlertModal } from "@/components/AlertModal";
import { AlertProvider } from "@/context/AlertContext";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import * as Sentry from "@sentry/react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../../global.css";

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

if (!sentryDsn) {
  throw new Error("Add EXPO_PUBLIC_SENTRY_DSN to your .env file");
}

Sentry.init({
  dsn: sentryDsn,
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],
});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

// 1. Define the Global Guard Hook
function useProtectedRoute() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    // Check if the user is currently trying to access the (auth) group
    const inAuthGroup = segments[0] === "(auth)";

    if (isSignedIn && inAuthGroup) {
      // If signed in and on the login screen, push to the main app
      router.replace("/(tabs)");
    } else if (!isSignedIn && !inAuthGroup) {
      // If NOT signed in and trying to access the app, push to login
      router.replace("/(auth)");
    }
  }, [isSignedIn, isLoaded, segments]);
}

// 2. Create a child layout to safely consume the Clerk context
// app/_layout.tsx
const InitialLayout = async () => {
  useProtectedRoute();
  const token = await fetch("/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId: "yemuel" }),
  });
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="search"
          options={{
            presentation: "modal",
            headerShown: false,
            title: "Search",
          }}
        />
      </Stack>
      <AlertModal />
    </>
  );
};

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AlertProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <InitialLayout />
        </GestureHandlerRootView>
      </AlertProvider>
    </ClerkProvider>
  );
}
