// hooks/useStudyStreak.ts
import { useAuth } from "@clerk/expo";
import { useEffect, useState } from "react";

export function useStudyStreak() {
  const { getToken } = useAuth();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const res = await fetch("/api/streak", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStreak(data.streak);
    })();
  }, []);

  return streak;
}
