// components/ChannelPreview.tsx
import { COLORS } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { ChannelPreviewViewPropsWithContext } from "stream-chat-expo";
import { useChatContext } from "stream-chat-expo";

type ChannelPreviewProps = Partial<
  Omit<ChannelPreviewViewPropsWithContext, "channel">
> &
  Pick<ChannelPreviewViewPropsWithContext, "channel">;

function formatTimestamp(date?: Date) {
  if (!date) return "";
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function attachmentPreview(type?: string) {
  if (type === "image") return "📷 Photo";
  if (type === "video") return "🎥 Video";
  if (type === "file") return "📎 File";
  return "Attachment";
}

export function ChannelPreview({ channel, onSelect }: ChannelPreviewProps) {
  const { client } = useChatContext();

  const [lastMessage, setLastMessage] = useState(
    channel.state.messages[channel.state.messages.length - 1],
  );
  const [unreadCount, setUnreadCount] = useState(channel.countUnread());

  useEffect(() => {
    const refresh = () => {
      setLastMessage(channel.state.messages[channel.state.messages.length - 1]);
      setUnreadCount(channel.countUnread());
    };
    channel.on("message.new", refresh);
    channel.on("message.read", refresh);
    channel.on("message.updated", refresh);
    return () => {
      channel.off("message.new", refresh);
      channel.off("message.read", refresh);
      channel.off("message.updated", refresh);
    };
  }, [channel]);

  const otherMembers = Object.values(channel.state.members).filter(
    (m) => m.user?.id !== client.userID,
  );
  const isGroup = otherMembers.length > 1;
  const displayName =
    (channel.data?.name as string | undefined) ||
    otherMembers.map((m) => m.user?.name).join(", ") ||
    "Unnamed";
  const avatarUrl =
    (channel.data?.image as string | undefined) || otherMembers[0]?.user?.image;
  const isOnline = !isGroup && otherMembers[0]?.user?.online;
  const hasUnread = unreadCount > 0;

  const previewText = lastMessage?.deleted_at
    ? "This message was deleted"
    : lastMessage?.attachments?.length
      ? attachmentPreview(lastMessage.attachments[0]?.type)
      : lastMessage?.text?.trim() || "No messages yet";

  const timestampText = formatTimestamp(
    lastMessage?.created_at as Date | undefined,
  );

  return (
    <Pressable
      onPress={() => onSelect?.(channel)}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      className="flex-row items-center gap-3 px-5 py-3"
      accessibilityRole="button"
      accessibilityLabel={`Open chat with ${displayName}`}
    >
      <View className="relative">
        {avatarUrl ? (
          <Image
            source={avatarUrl}
            style={{ width: 52, height: 52, borderRadius: 26 }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{ width: 52, height: 52, borderRadius: 26 }}
            className="items-center justify-center bg-surface border border-border"
          >
            <Ionicons
              name={isGroup ? "people" : "person"}
              size={22}
              color={COLORS.textMuted}
            />
          </View>
        )}
        {isOnline && (
          <View className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-accent-secondary border-2 border-background" />
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text
            numberOfLines={1}
            className={`text-[15px] flex-1 ${hasUnread ? "font-bold text-foreground" : "font-semibold text-foreground"}`}
          >
            {displayName}
          </Text>
          <Text
            className={`text-xs ml-2 ${hasUnread ? "font-semibold text-primary" : "text-foreground-muted"}`}
          >
            {timestampText}
          </Text>
        </View>

        <View className="flex-row items-center justify-between mt-0.5">
          <Text
            numberOfLines={1}
            className={`text-sm flex-1 ${hasUnread ? "text-foreground font-medium" : "text-foreground-muted"}`}
          >
            {previewText}
          </Text>
          {hasUnread && (
            <View className="ml-2 min-w-[20px] h-5 rounded-full bg-primary items-center justify-center px-1.5">
              <Text className="text-[11px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
