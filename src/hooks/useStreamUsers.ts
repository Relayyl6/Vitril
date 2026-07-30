import * as Sentry from "@sentry/react-native";
import { useEffect, useState } from "react";
import type { StreamChat, UserResponse } from "stream-chat";

const useStreamUsers = (client: StreamChat, userId: string) => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await client.queryUsers(
          {
            // id: { $nin: [userId] },
            role: { $in: ["user"] },
          } as any,
          {
            last_active: -1,
          },
          {
            limit: 50,
          },
        );
        setUsers(response.users);
      } catch (e) {
        console.error("Failed to fetch users", e);
        Sentry.captureException(e);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUsers();
  }, [client, userId]);

  return { users, loading };
};

export default useStreamUsers;
