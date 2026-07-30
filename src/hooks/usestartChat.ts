import { useAlertActions } from "@/context/AlertContext";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import type { Channel, StreamChat } from "stream-chat";

type UseStartChatParams = {
  client: StreamChat;
  userId: string;
  setChannel: (channel: Channel) => void;
  setCreating: (value: string | null) => void;
};

const useStartChat = ({
  client,
  userId,
  setChannel,
  setCreating,
}: UseStartChatParams) => {
  const { show } = useAlertActions();

  const router = useRouter();

  const handleStartChat = useCallback(
    async (targetId: string) => {
      if (!userId) return;
      setCreating(targetId);
      try {
        const channel = client.channel("messaging", {
          members: [userId, targetId],
        });
        await channel.watch();
        setChannel(channel);
        router.push(`/channel/${channel.cid}`);
      } catch (e) {
        console.error("Failed to start chat", e);
      } finally {
        setCreating(null);
      }
    },
    [client, userId, setChannel, setCreating, router],
  );

  const handleStartSelfChat = useCallback(async () => {
    if (!userId) return;
    setCreating(userId); // reuse the same loading-state slot
    try {
      const channel = client.channel("messaging", `self-${userId}`, {
        members: [userId],
      });
      await channel.watch();
      setChannel(channel);
      router.push(`/channel/${channel.cid}`);
    } catch (e) {
      console.error("Failed to open self chat", e);
    } finally {
      setCreating(null);
    }
  }, [client, userId, setChannel, setCreating, router]);

  return {
    handleStartChat,
    handleStartSelfChat,
  };
};

export default useStartChat;
