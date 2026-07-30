import { ChannelPreview } from "@/components/ChannelPreview";
import { useAppContext } from "@/context/AppContext";
import { COLORS } from "@/lib/theme";
import { getGreetingForHour } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Channel } from "stream-chat";
import { ChannelList, WithComponents } from "stream-chat-expo";

const Chats = () => {
  const { user } = useUser();
  const router = useRouter();
  const { setChannel } = useAppContext();

  const filters = useMemo(
    () => ({
      members: { $in: [user?.id ?? ""] },
      type: "messaging",
    }),
    [user?.id],
  );

  const handleSelectChannel = useCallback(
    (channel: Channel) => {
      setChannel(channel);
      router.push(`/channel/${channel.cid}`);
    },
    [router, setChannel],
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="px-5 pt-2 pb-3">
        <Text className="text-sm text-foreground-muted font-medium">
          {getGreetingForHour()},{" "}
          {user?.firstName ?? user?.username ?? "partner"}
        </Text>
        <Text className="text-2xl font-bold text-foreground mt-0.5">
          Messages
        </Text>
      </View>

      {/* Search bar — launches the dedicated search screen */}
      <Pressable
        onPress={() => router.push("/search")}
        className="flex-row items-center bg-surface mx-5 mb-4 px-3.5 py-2.5 rounded-2xl gap-2.5 border border-border"
        accessibilityRole="button"
        accessibilityLabel="Search chats and people"
      >
        <Ionicons name="search" size={18} color={COLORS.textMuted} />
        <Text className="flex-1 text-[15px] text-foreground-muted py-1">
          Search Vitril.xyz...
        </Text>
      </Pressable>

      {/* Section Label */}
      <View className="flex-row items-center px-5 mb-2 gap-2">
        <Ionicons name="chatbubbles" size={18} color={COLORS.primaryLight} />
        <Text className="text-[15px] font-semibold text-primary-light uppercase tracking-wider">
          Your Vitril Sessions
        </Text>
      </View>

      {/* Channel List */}
      <View className="flex-1">
        <WithComponents overrides={{ ChannelPreview }}>
          <ChannelList
            filters={filters}
            options={{ state: true, watch: true }}
            sort={{ last_updated: -1 }}
            onSelect={handleSelectChannel}
          />
        </WithComponents>
      </View>
    </SafeAreaView>
  );
};

export default Chats;
