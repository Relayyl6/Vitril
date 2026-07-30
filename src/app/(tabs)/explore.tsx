// import { useAlertActions } from "@/context/AlertContext";
// import { TabBarContext } from "@/context/TabBarContext";
// import { useRouter } from "expo-router";
// import { useContext, useEffect, useRef, useState } from "react";
// import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// for a video call
// const { startSession, endSession } = useCallSessionTracker();

// // When joining:
// const handleJoinCall = async () => {
//   await connectToVideoRoom();
//   await startSession(["peer-user-id-here"]); // Starts the DB clock
// };

// // When hanging up:
// const handleLeaveCall = async () => {
//   await disconnectFromVideoRoom();
//   await endSession(); // Stops the DB clock -> Your stats instantly increase!
// };

// const Explore = () => {
//   const { setAccessoryState } = useContext(TabBarContext);
//   const { show } = useAlertActions(); // 👈 Use your custom alert actions
//   const router = useRouter();

//   const [isPlaying, setIsPlaying] = useState(true);
//   const [callDuration, setCallDuration] = useState(0);
//   const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   useEffect(() => {
//     return () => {
//       if (callTimerRef.current) clearInterval(callTimerRef.current);
//     };
//   }, []);

//   const startCallTest = () => {
//     if (callTimerRef.current) clearInterval(callTimerRef.current);
//     setCallDuration(0);

//     let currentSeconds = 0;
//     const updateCallState = (secs: number) => {
//       setAccessoryState({
//         type: "activeCall",
//         name: "Sarah Jenkins",
//         durationSeconds: secs,
//         // Tapping the call bar triggers your custom AlertModal!
//         onPress: () =>
//           show("Active Call Tapped", "Opening full call screen...", "info"),
//       });
//     };

//     updateCallState(0);
//     callTimerRef.current = setInterval(() => {
//       currentSeconds += 1;
//       setCallDuration(currentSeconds);
//       updateCallState(currentSeconds);
//     }, 1000);
//   };

//   const stopCallTest = () => {
//     if (callTimerRef.current) clearInterval(callTimerRef.current);
//     setAccessoryState({ type: "none" });
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Accessory Playground 🧪</Text>
//       <Text style={styles.subtitle}>
//         Tap buttons to test. Notice you can now tap the floating bar itself!
//       </Text>

//       {/* 1. Test Now Playing */}
//       <Pressable
//         style={[styles.button, styles.musicButton]}
//         onPress={() => {
//           stopCallTest();
//           setAccessoryState({
//             type: "nowPlaying",
//             title: "Midnight City",
//             artist: "M83",
//             isPlaying: true,
//             onPress: () =>
//               show("Music Tapped", "Opening audio player...", "info"),
//           });
//         }}
//       >
//         <Text style={styles.buttonText}>🎵 Test "Now Playing"</Text>
//       </Pressable>

//       {/* 2. Test Active Call */}
//       <Pressable
//         style={[styles.button, styles.callButton]}
//         onPress={startCallTest}
//       >
//         <Text style={styles.buttonText}>
//           📞 Test "Active Call" (Live Timer)
//         </Text>
//       </Pressable>

//       {/* 3. Test Typing */}
//       <Pressable
//         style={[styles.button, styles.typingButton]}
//         onPress={() => {
//           stopCallTest();
//           setAccessoryState({
//             type: "typing",
//             name: "Alex",
//             // Tapping Alex's typing notification routes you safely to the main chats tab!
//             onPress: () => {
//               setAccessoryState({ type: "none" });
//               router.push("/");
//             },
//           });
//         }}
//       >
//         <Text style={styles.buttonText}>💬 Test "Alex is typing..."</Text>
//       </Pressable>

//       {/* 4. Test Draft Reply */}
//       <Pressable
//         style={[styles.button, styles.draftButton]}
//         onPress={() => {
//           stopCallTest();
//           setAccessoryState({
//             type: "draftReply",
//             recipient: "Mom",
//             preview: "I'll be home in about 20 minutes, save me some dinner!",
//             onPress: () =>
//               show("Resume Draft", "Opening thread with Mom...", "info"),
//           });
//         }}
//       >
//         <Text style={styles.buttonText}>📝 Test "Draft Reply"</Text>
//       </Pressable>

//       {/* 5. Clear Accessory */}
//       <Pressable
//         style={[styles.button, styles.clearButton]}
//         onPress={stopCallTest}
//       >
//         <Text style={[styles.buttonText, { color: "#EF4444" }]}>
//           ❌ Dismiss / Clear
//         </Text>
//       </Pressable>

//       <View style={styles.divider} />

//       <Text style={styles.subtitle}>Test Safe Navigation:</Text>
//       <Pressable
//         style={styles.navButton}
//         onPress={() => {
//           stopCallTest();
//           router.push("/");
//         }}
//       >
//         <Text style={styles.buttonText}>Go to Chats Tab 💬</Text>
//       </Pressable>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 24,
//     gap: 12,
//     backgroundColor: "#F9FAFB",
//   },
//   title: { fontSize: 22, fontWeight: "800", color: "#111827", marginBottom: 4 },
//   subtitle: {
//     fontSize: 14,
//     color: "#6B7280",
//     marginBottom: 8,
//     textAlign: "center",
//   },
//   button: {
//     width: "100%",
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     borderRadius: 16,
//     alignItems: "center",
//     elevation: 2,
//   },
//   musicButton: { backgroundColor: "#8B5CF6" },
//   callButton: { backgroundColor: "#10B981" },
//   typingButton: { backgroundColor: "#3B82F6" },
//   draftButton: { backgroundColor: "#F59E0B" },
//   clearButton: {
//     backgroundColor: "#FEE2E2",
//     borderWidth: 1,
//     borderColor: "#FCA5A5",
//     marginTop: 8,
//   },
//   navButton: {
//     width: "100%",
//     backgroundColor: "#1F2937",
//     paddingVertical: 14,
//     borderRadius: 16,
//     alignItems: "center",
//   },
//   buttonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
//   divider: {
//     width: "80%",
//     height: 1,
//     backgroundColor: "#E5E7EB",
//     marginVertical: 12,
//   },
// });

// export default Explore;

import ExploreUserCard from "@/components/ExploreUserCard";
import ListEmptyComponent from "@/components/ListEmptyComponent";
import { useAppContext } from "@/context/AppContext";
import useStartChat from "@/hooks/usestartChat";
import useStreamUsers from "@/hooks/useStreamUsers";
import { COLORS } from "@/lib/theme";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { UserResponse } from "stream-chat";
import { useChatContext } from "stream-chat-expo";

const Explore = () => {
  const { setChannel } = useAppContext();
  const { user } = useUser();
  const { channel } = useAppContext();
  const { client } = useChatContext();
  const userId = user?.id ?? "";
  const router = useRouter();

  const [creating, setCreating] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Assumes useStreamUsers can expose `error` + `refetch` — add these to the
  // hook if it doesn't already. Falling back gracefully if it doesn't.
  const { users, loading, error, refetch } = useStreamUsers(client, userId) as {
    users: UserResponse[];
    loading: boolean;
    error?: unknown;
    refetch?: () => Promise<void>;
  };

  const { handleStartChat, handleStartSelfChat } = useStartChat({
    client,
    userId,
    setChannel,
    setCreating,
  });

  // TODO: wire this to your video call SDK once call-starting logic exists.
  const handleStartCall = (targetId: string) => {
    console.warn("Call flow not yet implemented for", targetId);
    router.push({
      pathname: "/call/[callId]",
      params: { callId: channel?.id },
    });
  };

  const handleEndCall = (targetId: string) => {
    console.warn("Call flow not yet implemented for", targetId);
  };

  const onRefresh = async () => {
    if (!refetch) return;
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const renderUserItem = ({ item }: { item: UserResponse }) => (
    <ExploreUserCard
      item={item}
      creating={creating}
      onStartChat={handleStartChat}
      onStartCall={handleStartCall}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-3 pb-1">
        <Text className="text-[20px] font-bold text-foreground">Explore</Text>
        <Text className="text-sm text-foreground-muted">
          Find people to chat and call
        </Text>
      </View>

      {/* search bar — launcher only, real filtering lives in /search */}
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

      {/* users list */}
      {loading ? (
        <View className="flex-1 items-center justify-center pt-10">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-10">
          <Ionicons
            name="alert-circle-outline"
            size={40}
            color={COLORS.textMuted}
          />
          <Text className="text-sm text-foreground-muted mt-3 text-center">
            Couldn't load people right now.
          </Text>
          {refetch && (
            <Pressable
              onPress={onRefresh}
              className="mt-4 px-4 py-2 rounded-xl bg-surface border border-border"
            >
              <Text className="text-sm font-semibold text-foreground">
                Try again
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        <>
          <Pressable
            onPress={handleStartSelfChat}
            disabled={creating !== null}
            className="flex-row items-center bg-surface rounded-2xl p-3.5 mb-2.5 border border-border gap-3.5"
          >
            <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center">
              <Ionicons name="bookmark" size={20} color={COLORS.primary} />
            </View>
            <Text className="text-base font-semibold text-foreground">
              Notes to Self
            </Text>
          </Pressable>
          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              refetch ? (
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              ) : undefined
            }
            ListEmptyComponent={() => <ListEmptyComponent />}
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default Explore;
