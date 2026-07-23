import { Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "expo-router";
import { TabBarContext } from "@/context/TabBarContext";
import { useAlertActions } from "@/context/AlertContext";

const Explore = () => {
  const { setAccessoryState } = useContext(TabBarContext);
  const { show } = useAlertActions(); // 👈 Use your custom alert actions
  const router = useRouter();

  const [isPlaying, setIsPlaying] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, []);

  const startCallTest = () => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setCallDuration(0);
    
    let currentSeconds = 0;
    const updateCallState = (secs: number) => {
      setAccessoryState({ 
        type: "activeCall", 
        name: "Sarah Jenkins", 
        durationSeconds: secs,
        // Tapping the call bar triggers your custom AlertModal!
        onPress: () => show("Active Call Tapped", "Opening full call screen...", "info")
      });
    };

    updateCallState(0);
    callTimerRef.current = setInterval(() => {
      currentSeconds += 1;
      setCallDuration(currentSeconds);
      updateCallState(currentSeconds);
    }, 1000);
  };

  const stopCallTest = () => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setAccessoryState({ type: "none" });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Accessory Playground 🧪</Text>
      <Text style={styles.subtitle}>Tap buttons to test. Notice you can now tap the floating bar itself!</Text>

      {/* 1. Test Now Playing */}
      <Pressable
        style={[styles.button, styles.musicButton]}
        onPress={() => {
          stopCallTest();
          setAccessoryState({
            type: "nowPlaying",
            title: "Midnight City",
            artist: "M83",
            isPlaying: true,
            onPress: () => show("Music Tapped", "Opening audio player...", "info"),
          });
        }}
      >
        <Text style={styles.buttonText}>🎵 Test "Now Playing"</Text>
      </Pressable>

      {/* 2. Test Active Call */}
      <Pressable style={[styles.button, styles.callButton]} onPress={startCallTest}>
        <Text style={styles.buttonText}>📞 Test "Active Call" (Live Timer)</Text>
      </Pressable>

      {/* 3. Test Typing */}
      <Pressable
        style={[styles.button, styles.typingButton]}
        onPress={() => {
          stopCallTest();
          setAccessoryState({ 
            type: "typing", 
            name: "Alex",
            // Tapping Alex's typing notification routes you safely to the main chats tab!
            onPress: () => {
              setAccessoryState({ type: "none" });
              router.push("/");
            }
          });
        }}
      >
        <Text style={styles.buttonText}>💬 Test "Alex is typing..."</Text>
      </Pressable>

      {/* 4. Test Draft Reply */}
      <Pressable
        style={[styles.button, styles.draftButton]}
        onPress={() => {
          stopCallTest();
          setAccessoryState({
            type: "draftReply",
            recipient: "Mom",
            preview: "I'll be home in about 20 minutes, save me some dinner!",
            onPress: () => show("Resume Draft", "Opening thread with Mom...", "info"),
          });
        }}
      >
        <Text style={styles.buttonText}>📝 Test "Draft Reply"</Text>
      </Pressable>

      {/* 5. Clear Accessory */}
      <Pressable style={[styles.button, styles.clearButton]} onPress={stopCallTest}>
        <Text style={[styles.buttonText, { color: "#EF4444" }]}>❌ Dismiss / Clear</Text>
      </Pressable>

      <View style={styles.divider} />

      <Text style={styles.subtitle}>Test Safe Navigation:</Text>
      <Pressable
        style={styles.navButton}
        onPress={() => {
          stopCallTest();
          router.push("/");
        }}
      >
        <Text style={styles.buttonText}>Go to Chats Tab 💬</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
    backgroundColor: "#F9FAFB",
  },
  title: { fontSize: 22, fontWeight: "800", color: "#111827", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#6B7280", marginBottom: 8, textAlign: "center" },
  button: { width: "100%", paddingVertical: 14, paddingHorizontal: 20, borderRadius: 16, alignItems: "center", elevation: 2 },
  musicButton: { backgroundColor: "#8B5CF6" },
  callButton: { backgroundColor: "#10B981" },
  typingButton: { backgroundColor: "#3B82F6" },
  draftButton: { backgroundColor: "#F59E0B" },
  clearButton: { backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: "#FCA5A5", marginTop: 8 },
  navButton: { width: "100%", backgroundColor: "#1F2937", paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  buttonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  divider: { width: "80%", height: 1, backgroundColor: "#E5E7EB", marginVertical: 12 },
});

export default Explore;