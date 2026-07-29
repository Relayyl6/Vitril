// src/app/search.tsx
import { useAppContext } from "@/context/AppContext";
import { COLORS } from "@/lib/theme";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Channel, UserResponse } from "stream-chat";
import { useChatContext } from "stream-chat-expo";

type ChannelResult = { type: "channel"; channel: Channel };
type UserResult = { type: "user"; user: UserResponse };
type SearchResult = ChannelResult | UserResult;

const DEBOUNCE_MS = 350;

export default function SearchScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { client } = useChatContext();
  const { setChannel } = useAppContext();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const [channelResults, userResults] = await Promise.all([
          client.queryChannels(
            {
              members: { $in: [user?.id ?? ""] },
              type: "messaging",
              name: { $autocomplete: trimmed },
            },
            { last_message_at: -1 },
            { limit: 10 },
          ),
          client.queryUsers(
            {
              id: { $ne: user?.id ?? "" },
              name: { $autocomplete: trimmed },
            },
            { name: 1 },
            { limit: 10 },
          ),
        ]);

        setResults([
          ...channelResults.map((channel): ChannelResult => ({
            type: "channel",
            channel,
          })),
          ...userResults.users.map((u): UserResult => ({
            type: "user",
            user: u,
          })),
        ]);
      } catch (err) {
        console.warn("Search failed", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, client, user?.id]);

  const openChannel = useCallback(
    (channel: Channel) => {
      setChannel(channel);
      router.replace(`/channel/${channel.id}`);
    },
    [router, setChannel],
  );

  const startChatWithUser = useCallback(
    async (targetUser: UserResponse) => {
      if (!user?.id || startingChat) return;
      setStartingChat(true);
      try {
        const channel = client.channel("messaging", {
          members: [user.id, targetUser.id],
        });
        await channel.watch();
        openChannel(channel);
      } catch (err) {
        console.warn("Failed to start chat", err);
      } finally {
        setStartingChat(false);
      }
    },
    [client, user?.id, startingChat, openChannel],
  );

  const renderItem = ({ item }: { item: SearchResult }) => {
    if (item.type === "channel") {
      const { channel } = item;
      const otherMembers = Object.values(channel.state.members).filter(
        (m) => m.user?.id !== user?.id,
      );
      const name =
        (channel.data?.name as string | undefined) ||
        otherMembers.map((m) => m.user?.name).join(", ") ||
        "Unnamed";
      const avatar =
        (channel.data?.image as string | undefined) ||
        otherMembers[0]?.user?.image;

      return (
        <ResultRow
          name={name}
          subtitle="Existing session"
          avatarUrl={avatar}
          icon="chatbubble-ellipses"
          onPress={() => openChannel(channel)}
        />
      );
    }

    const { user: u } = item;
    return (
      <ResultRow
        name={u.name || u.id}
        subtitle="Start a new session"
        avatarUrl={u.image as string | undefined}
        icon="person"
        onPress={() => startChatWithUser(u)}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header: back button + input */}
      <View className="flex-row items-center gap-2 px-3 pt-2 pb-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          className="p-2"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={COLORS.primaryLight ?? "#000"}
          />
        </Pressable>

        <View className="flex-1 flex-row items-center bg-surface px-3.5 py-2.5 rounded-2xl gap-2.5 border border-border">
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Search chats and people..."
            placeholderTextColor={COLORS.textMuted}
            className="flex-1 text-[15px] text-foreground py-0.5"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => setQuery("")}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={COLORS.textMuted}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Body */}
      {loading || startingChat ? (
        <View className="flex-1 items-center justify-center pt-10">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : query.trim().length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Ionicons name="search" size={40} color={COLORS.textMuted} />
          <Text className="text-sm text-foreground-muted mt-3 text-center">
            Search for a session or a person to start chatting with.
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-sm text-foreground-muted text-center">
            No results for "{query.trim()}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) =>
            item.type === "channel"
              ? `c-${item.channel.cid}`
              : `u-${item.user.id}`
          }
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

function ResultRow({
  name,
  subtitle,
  avatarUrl,
  icon,
  onPress,
}: {
  name: string;
  subtitle: string;
  avatarUrl?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      className="flex-row items-center gap-3 px-5 py-3"
      accessibilityRole="button"
      accessibilityLabel={name}
    >
      {avatarUrl ? (
        <Image
          source={avatarUrl}
          style={{ width: 44, height: 44, borderRadius: 22 }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{ width: 44, height: 44, borderRadius: 22 }}
          className="items-center justify-center bg-surface border border-border"
        >
          <Ionicons name={icon} size={20} color={COLORS.textMuted} />
        </View>
      )}
      <View className="flex-1">
        <Text className="text-[15px] font-semibold text-foreground">
          {name}
        </Text>
        <Text className="text-xs text-foreground-muted mt-0.5">{subtitle}</Text>
      </View>
    </Pressable>
  );
}
