import { useAlertActions } from "@/context/AlertContext";
import { useRouter } from "expo-router";
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

  const handleStartChat = async (targetId: string) => {
    setCreating(targetId);

    try {
      const channel = client.channel("messaging", {
        members: [userId, targetId],
      });
      await channel.watch();

      setChannel(channel);
      router.push(`/channel/${channel.cid}`);
    } catch (e) {
      console.error("Error creating chat", e);
      show("Error", "Could not create chat. Please try again.", "error");
    } finally {
      setCreating(null);
    }
  };

  return {
    handleStartChat,
  };
};

export default useStartChat;
