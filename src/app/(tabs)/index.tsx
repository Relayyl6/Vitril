import { useAppContext } from "@/context/AppContext";
import { COLORS } from "@/lib/theme";
import { getGreetingForHour } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Channel } from "stream-chat";
import { ChannelList } from "stream-chat-expo";

const Chats = () => {
  const { user } = useUser();
  const router = useRouter();
  const { setChannel } = useAppContext();
  const [searchValue, setSearchValue] = useState("");

  // 1. Memoize filters so Stream doesn't re-subscribe on unnecessary re-renders
  const filters = useMemo(
    () => ({
      members: { $in: [user?.id ?? ""] },
      type: "messaging",
    }),
    [user?.id],
  );

  // 2. Memoize channel filter function for search
  const channelRenderFilterFn = useCallback(
    (channels: Channel[]) => {
      if (!searchValue.trim()) return channels;

      const q = searchValue.toLowerCase();
      return channels.filter((channel) => {
        const name =
          (channel.data?.name as string | undefined)?.toLowerCase() ?? "";
        const cid = channel.cid.toLowerCase();
        return name.includes(q) || cid.includes(q);
      });
    },
    [searchValue],
  );

  const handleSelectChannel = useCallback(
    (channel: Channel) => {
      Keyboard.dismiss();
      setChannel(channel);
      router.push(`/channel/${channel.id}`);
    },
    [router, setChannel],
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header section with consistent horizontal padding */}
      <View className="px-5 pt-2 pb-3">
        <Text className="text-sm text-foreground-muted font-medium">
          {getGreetingForHour()},{" "}
          {user?.firstName ?? user?.username ?? "partner"}
        </Text>
        <Text className="text-2xl font-bold text-foreground mt-0.5">
          Messages
        </Text>
      </View>

      {/* Search Bar - PROPERLY CLOSED before the channel list */}
      <View className="flex-row items-center bg-surface mx-5 mb-4 px-3.5 py-2.5 rounded-2xl gap-2.5 border border-border">
        <Ionicons name="search" size={18} color={COLORS.textMuted} />
        <TextInput
          className="flex-1 text-[15px] text-foreground py-1"
          placeholder="Search Vitril.xyz..."
          placeholderTextColor={COLORS.textMuted}
          value={searchValue}
          onChangeText={setSearchValue}
          returnKeyType="search"
          autoCorrect={false}
        />
        {/* Added a clear button when typing */}
        {searchValue.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchValue("")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Section Label */}
      <View className="flex-row items-center px-5 mb-2 gap-2">
        <Ionicons name="chatbubbles" size={18} color={COLORS.primaryLight} />
        <Text className="text-[15px] font-semibold text-primary-light uppercase tracking-wider">
          Your Vitril Sessions
        </Text>
      </View>

      {/* Channel List */}
      <View className="flex-1">
        <ChannelList
          filters={filters}
          options={{ state: true, watch: true }}
          sort={{ last_updated: -1 }}
          channelRenderFilterFn={channelRenderFilterFn}
          onSelect={handleSelectChannel}
          additionalFlatListProps={{
            contentContainerStyle: { flexGrow: 1, paddingBottom: 20 },
            keyboardShouldPersistTaps: "handled",
            onScrollBeginDrag: Keyboard.dismiss,
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Chats;
