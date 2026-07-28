import { useAppContext } from "@/context/AppContext";
import { COLORS } from "@/lib/theme";
import { getGreetingForHour } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Channel } from "stream-chat";
import { ChannelList } from "stream-chat-expo";

const Chats = () => {
  const { user } = useUser();
  const router = useRouter();
  const { setChannel } = useAppContext();
  const [searchValue, setSearchValue] = useState("");

  const filters = {
    members: { $in: [user?.id!] },
    type: "messaging",
  };

  const channelRenderFilterFn = (channels: Channel[]) => {
    if (!searchValue.trim()) return channels;

    const q = searchValue.toLowerCase();

    return channels.filter((channel) => {
      const name =
        (channel.data?.name as string | undefined)?.toLowerCase() ?? "";
      const cid = channel.cid.toLowerCase();
      return name.includes(q) || cid.includes(q);
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* header */}
      <Text className="text-sm text-foreground-muted mb-0.5">
        {getGreetingForHour()}, {user?.firstName ?? user?.username ?? "partner"}
      </Text>

      {/* search bar  */}
      <View className="flex-row items-center bg-surface mx-5 mb-3 px-3.5 py-3 rounded-[14px] gap-2.5 border border-border">
        <Ionicons name="search" size={18} color={COLORS.textMuted} />
        <TextInput
          className="flex-1 text-[15px] text-foreground"
          placeholder="Search Vitril.xyz"
          placeholderTextColor={COLORS.textMuted}
          value={searchValue}
          onChangeText={setSearchValue}
        />
        {/* Section label */}
        <View className="flex-row items-center px-5 my-1.5 gap-2">
          <Ionicons name="chatbubbles" size={18} color={COLORS.primaryLight} />
          <Text className="text-[15px] font-semibold text-primary-light">
            Your Vitril Sessions
          </Text>
        </View>
        {/* Channel List */}
        <ChannelList
          filters={filters}
          options={{ state: true, watch: true }}
          sort={{ last_updated: -1 }}
          channelRenderFilterFn={channelRenderFilterFn}
          onSelect={(channel) => {
            setChannel(channel);
            router.push(`/channel/${channel.id}`);
          }}
          additionalFlatListProps={{
            contentContainerStyle: { flexGrow: 1 },
          }}
        />
        {/* state: true will fetch initial full data of the channel and watch:
        true will keeep the hcannel updated with the latest data */}
      </View>
    </SafeAreaView>
  );
};

export default Chats;
