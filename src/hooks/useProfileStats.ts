import { useAuth } from "@clerk/expo";
import * as Sentry from "@sentry/react-native";
import { useCallback, useEffect, useState } from "react";

interface ProfileStats {
  sessionsHosted: number;
  sessionsAttended: number;
  callMinutes: number;
  avgRating: number;
  lastUpdated: Date;
}

/**
 * Fetches user profile statistics from the backend.
 *
 * Caches locally to avoid excessive API calls, but invalidates on:
 * - Initial mount
 * - When user changes
 * - After 5 minutes (staleness threshold)
 * - On manual refresh
 *
 * Why this pattern?
 * - Stats are expensive to compute server-side (aggregating call logs)
 * - But they don't change frequently, so stale data (5m) is acceptable
 * - Caching prevents flickering and reduces backend load
 * - Manual refresh gives users control when they want current data
 */
export const useProfileStats = (stalnesThresholdMs = 5 * 60 * 1000) => {
  const { userId, getToken } = useAuth();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(
    async (force = false) => {
      if (!userId) {
        setLoading(false);
        return;
      }

      // Check if cached data is still fresh
      if (stats && !force) {
        const age = Date.now() - stats.lastUpdated.getTime();
        if (age < stalnesThresholdMs) {
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const token = await getToken(); // <-- Fetch active JWT

        const response = await fetch(`/api/users/${userId}/stats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // <-- Send token to Expo API
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const parsedStats: ProfileStats = {
          sessionsHosted: data.sessionsHosted || 0,
          sessionsAttended: data.sessionsAttended || 0,
          callMinutes: data.callMinutes || 0,
          avgRating: data.avgRating || 0,
          lastUpdated: new Date(),
        };

        setStats(parsedStats);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        Sentry.captureException(err, {
          tags: { context: "useProfileStats" },
          extra: { userId },
        });

        // Return default empty stats on error (UI doesn't break)
        setStats({
          sessionsHosted: 0,
          sessionsAttended: 0,
          callMinutes: 0,
          avgRating: 0,
          lastUpdated: new Date(),
        });
      } finally {
        setLoading(false);
      }
    },
    [userId, stats, stalnesThresholdMs],
  );

  // Initial fetch on mount or when userId changes
  useEffect(() => {
    fetchStats();
  }, [userId]); // Intentionally omit fetchStats from deps to avoid infinite loops

  // Return stats and a refetch function for manual refresh
  return {
    ...stats,
    loading,
    error,
    refetch: () => fetchStats(true), // force = true for manual refresh
  };
};
