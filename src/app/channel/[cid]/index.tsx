import EmptyState from "@/components/EmptyState";
import FullScreenLoader from "@/components/FullScreenLoader";
import { useAppContext } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import type { LocalMessage } from "stream-chat";
import {
    Channel,
    MessageInput,
    MessageList,
    useChatContext,
} from "stream-chat-expo";
// Note: If MessageInput still fails, change the above line to import from 'stream-chat-react-native'

const ChannelScreen = () => {
  const { channel, setThread } = useAppContext();
  const { client } = useChatContext();
  const router = useRouter();
  const headerHeight = useHeaderHeight();

  let displayName = "Unknown User";
  let avatarUrl = "";

  if (channel) {
    const members = Object.values(channel.state.members);
    const otherMember = members.find(
      (member) => member.user_id !== client.userID,
    );
    displayName = (otherMember?.user?.name as string) || "User";
    avatarUrl = otherMember?.user?.image || "";
  }

  if (!channel) return <FullScreenLoader message="Loading study room ..." />;

  return (
    <View className="flex-1 bg-[#F4F6F5]">
      {/* 
        Customizing the Header to match the UI image: 
        Centered Title, rounded back button, rounded ellipsis button.
      */}
      <Stack.Screen
        options={{
          headerTitle: displayName,
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#F4F6F5" },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-white ml-2 shadow-sm"
            >
              <Ionicons name="arrow-back" size={20} color="black" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-white mr-2 shadow-sm">
              <Ionicons name="ellipsis-horizontal" size={20} color="black" />
            </Pressable>
          ),
        }}
      />

      <Channel channel={channel} keyboardVerticalOffset={headerHeight}>
        <MessageList
          // Moved EmptyStateIndicator here to fix the TypeScript error
          EmptyStateIndicator={() => (
            <EmptyState
              icon="book-outline"
              title="No messages yet"
              subtitle="Start a study conversation"
            />
          )}
          onThreadSelect={(thread) => {
            setThread(thread as LocalMessage);
            // Cast as Href to bypass Expo Router's strict literal string typing
            // Note: Use thread.id rather than thread.cid for standard messages
            router.push(`/channel/${channel.cid}/thread/${thread.id}`);
          }}
        />

        <View className="pb-5 px-2 bg-transparent">
          <MessageInput />
        </View>
      </Channel>
    </View>
  );
};

export default ChannelScreen;
