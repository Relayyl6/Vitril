import Avatar from "@/components/Avatar";
import { CustomInput } from "@/components/CustomMessageInput";
import FullScreenLoader from "@/components/FullScreenLoader";
import GroupAvatar from "@/components/GroupAvatar";
import {
    CustomSuggestionHeader,
    StreamButton,
} from "@/components/StreamButton";
import { useAppContext } from "@/context/AppContext";
import { COLORS } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRouter } from "expo-router";
import React, { useLayoutEffect } from "react";
import { Pressable, Text, View } from "react-native";
import type { LocalMessage } from "stream-chat";
import {
    Channel,
    MessageComposer,
    MessageList,
    useChatContext,
    WithComponents,
} from "stream-chat-expo";

const ChannelScreen = () => {
  const { channel, setThread } = useAppContext();
  const { client } = useChatContext();
  const router = useRouter();
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();

  if (!channel) return <FullScreenLoader message="Loading study room ..." />;

  const members = Object.values(channel.state.members);
  const otherMembers = members.filter((m) => m.user_id !== client.userID);
  const isSelfChat = otherMembers.length === 0 && members.length === 1;
  const isGroup = otherMembers.length > 1;

  const displayName = isSelfChat
    ? "You (Notes to Self)"
    : isGroup
      ? (channel.data?.name as string | undefined) || "Group"
      : otherMembers[0]?.user?.name || "Unknown User";

  const headerAvatar = isSelfChat ? (
    <Avatar
      size={32}
      name={client.user?.name as string}
      image={client.user?.image}
    />
  ) : isGroup ? (
    <GroupAvatar
      size={32}
      members={otherMembers.map((m) => ({
        name: m.user?.name,
        image: m.user?.image,
      }))}
    />
  ) : (
    <Avatar size={32} name={displayName} image={otherMembers[0]?.user?.image} />
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitleAlign: "center",
      headerStyle: {
        backgroundColor: "#FFFFFF",
        // elevation: 0,
      },
      headerShadowVisible: false,
      headerTintcolor: COLORS.text,
      headerTitle: () => (
        <View className="flex-row items-center gap-3">
          {headerAvatar}
          <Text
            className="text-sm font-semibold text-foreground"
            numberOfLines={1}
          >
            {displayName}
          </Text>
        </View>
      ),
      headerLeft: () => (
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center bg-gray-100 rounded-full ml-4"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          className="h-10 w-10 items-center justify-center bg-gray-100 rounded-full mr-4"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="#1A1A1A" />
        </Pressable>
      ),
    });
  }, [navigation, displayName, channel?.cid, channel?.id]);

  return (
    <View className="flex-1 bg-white">
      <Channel
        channel={channel}
        keyboardVerticalOffset={headerHeight}
        additionalTextInputProps={{
          style: { color: COLORS.primary },
          placeholder: "Type a message",
          placeholderTextColor: "blue",
        }}
        audioRecordingEnabled={true}
      >
        <MessageList
          onThreadSelect={(thread) => {
            setThread(thread as LocalMessage);
            router.push(`/channel/${channel?.cid}/thread/${thread?.cid}`);
          }}
        />
        <View>
          {/* <MessageComposer /> */}
          <WithComponents
            overrides={{
              Input: CustomInput,
              SendButton: StreamButton,
              //   AttachButton: CustomAttachButton,
              AutoCompleteSuggestionHeader: CustomSuggestionHeader,
            }}
          >
            <MessageComposer audioRecordingSendOnComplete={false} />
          </WithComponents>
        </View>
      </Channel>
    </View>
  );
};

export default ChannelScreen;
