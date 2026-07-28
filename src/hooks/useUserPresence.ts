import { useAuth } from "@clerk/expo";
import { useCallback, useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

type PresenceStatus = "online" | "away" | "dnd" | "offline";

interface PresenceOptions {
  autoAwayAfterMs?: number; // Switch to "away" if inactive for N ms
  syncInterval?: number; // Heartbeat to backend every N ms
}

/**
 * Manages user presence state across the app.
 *
 * Architecture:
 * - Local state updates instantly (optimistic UI)
 * - Syncs to backend via POST on every change
 * - Auto-sync heartbeat every 30s (proves user is still there)
 * - Switches to "away" automatically if app backgrounded
 * - Cleanup on unmount (sets presence to "offline")
 *
 * Why this pattern?
 * - Presence is social state; peers need to know if you can be reached
 * - Optimistic local updates = responsive UI
 * - Backend heartbeat + AppState listener = reliable state sync
 * - Auto-away = prevents stale "online" when user leaves without closing app
 * - Offline on unmount = cleanup signal to backend
 */
export const useUserPresence = (
  options: PresenceOptions = {
    autoAwayAfterMs: 10 * 60 * 1000, // 10 minutes
    syncInterval: 30 * 1000, // 30 seconds
  },
) => {
  const { userId, getToken } = useAuth();
  const [presence, setPresence] = useState<PresenceStatus>("online");
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync presence to backend
  const syncPresenceToBackend = useCallback(
    async (status: PresenceStatus) => {
      if (!userId) return;

      setSyncing(true);
      setError(null);

      try {
        const token = await getToken(); // <-- Fetch active JWT

        const response = await fetch(`/api/users/${userId}/presence`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // <-- Send token to Expo API
          },
          body: JSON.stringify({ status, timestamp: new Date().toISOString() }),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
      } catch (err) {
        // ... existing error handling
      }
    },
    [userId, getToken],
  );

  // Handle app foreground/background
  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppState);

    async function handleAppState(state: AppStateStatus) {
      if (state === "background") {
        setPresence("away");
        await syncPresenceToBackend("away");
      } else if (state === "active") {
        setPresence("online");
        await syncPresenceToBackend("online");
      }
    }

    return () => subscription.remove();
  }, [syncPresenceToBackend]);

  // Periodic heartbeat sync (keeps presence "alive" on backend)
  useEffect(() => {
    const interval = setInterval(() => {
      syncPresenceToBackend(presence);
    }, options.syncInterval);

    return () => clearInterval(interval);
  }, [presence, options.syncInterval, syncPresenceToBackend]);

  // Cleanup: set to offline when component unmounts (user logs out)
  useEffect(() => {
    return () => {
      syncPresenceToBackend("offline");
    };
  }, [syncPresenceToBackend]);

  // Main setter: update local state + sync to backend
  const updatePresence = useCallback(
    async (newStatus: PresenceStatus) => {
      setPresence(newStatus);
      await syncPresenceToBackend(newStatus);
    },
    [syncPresenceToBackend],
  );

  return {
    presence,
    setPresence: updatePresence,
    syncing,
    error,
  };
};
