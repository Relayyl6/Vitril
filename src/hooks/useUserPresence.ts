// Inside useUserPresence.ts
import { useAuth } from "@clerk/expo";
import * as Sentry from "@sentry/react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

export const useUserPresence = (
  options = {
    autoAwayAfterMs: 10 * 60 * 1000,
    syncInterval: 30 * 1000,
  },
) => {
  // 1. Grab isLoaded to prevent premature network calls
  const { isLoaded, userId, getToken } = useAuth();
  const [presence, setPresence] = useState<
    "online" | "away" | "dnd" | "offline"
  >("online");
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep a ref so the interval always fires the freshest state without re-triggering useEffect
  const presenceRef = useRef(presence);
  presenceRef.current = presence;

  const syncPresenceToBackend = useCallback(
    async (status: "online" | "away" | "dnd" | "offline") => {
      // 2. Abort immediately if Clerk hasn't initialized or user is logged out
      if (!isLoaded || !userId) return;

      setSyncing(true);
      setError(null);

      try {
        const token = await getToken();
        if (!token) throw new Error("No authentication token available");

        const response = await fetch(`/api/users/${userId}/presence`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, timestamp: new Date().toISOString() }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Sync failed";
        setError(errorMsg);
        Sentry.captureException(err, {
          tags: { context: "useUserPresence" },
          extra: { userId, attemptedStatus: status },
        });
      } finally {
        setSyncing(false);
      }
    },
    [isLoaded, userId, getToken],
  );

  // 3. GUARANTEE INITIAL ROW CREATION: Fire as soon as Clerk confirms the user is loaded
  useEffect(() => {
    if (isLoaded && userId) {
      syncPresenceToBackend("online");
    }
  }, [isLoaded, userId, syncPresenceToBackend]);

  // Handle app foreground/background
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (state: AppStateStatus) => {
        if (state === "background") {
          setPresence("away");
          syncPresenceToBackend("away");
        } else if (state === "active") {
          setPresence("online");
          syncPresenceToBackend("online");
        }
      },
    );

    return () => subscription.remove();
  }, [syncPresenceToBackend]);

  // Periodic heartbeat
  useEffect(() => {
    if (!isLoaded || !userId) return;

    const interval = setInterval(() => {
      syncPresenceToBackend(presenceRef.current);
    }, options.syncInterval);

    return () => clearInterval(interval);
  }, [isLoaded, userId, options.syncInterval, syncPresenceToBackend]);

  const updatePresence = useCallback(
    async (newStatus: "online" | "away" | "dnd" | "offline") => {
      setPresence(newStatus);
      await syncPresenceToBackend(newStatus);
    },
    [syncPresenceToBackend],
  );

  return { presence, setPresence: updatePresence, syncing, error };
};
