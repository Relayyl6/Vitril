import FullScreenLoader from "@/components/FullScreenLoader";
import { useAppContext } from "@/context/AppContext";
import { useHeaderHeight } from "@react-navigation/elements";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Channel, Thread } from "stream-chat-expo";

const ThreadScreen = () => {
  const { channel, thread, setThread } = useAppContext();
  const headerHeight = useHeaderHeight();

  if (channel === null)
    return <FullScreenLoader message="Loading Thread ..." />;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <Channel
        channel={channel}
        thread={thread}
        threadList
        keyboardVerticalOffset={headerHeight}
      >
        <View className="flex-1 justify-start">
          <Thread onThreadDismount={() => setThread(null)} />
        </View>
      </Channel>
    </SafeAreaView>
  );
};

export default ThreadScreen;
