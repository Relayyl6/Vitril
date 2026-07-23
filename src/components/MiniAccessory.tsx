import { Pressable, Text, View, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBottomAccessoryPlacement } from "@/hooks/useBottomAccessoryPlacement";

export type AccessoryState =
  | { type: "none" }
  | { type: "nowPlaying"; title: string; artist: string; isPlaying: boolean; onPress?: () => void }
  | { type: "activeCall"; name: string; durationSeconds: number; onPress?: () => void }
  | { type: "typing"; name: string; onPress?: () => void }
  | { type: "draftReply"; recipient: string; preview: string; onPress?: () => void };

export default function MiniAccessory({
  state,
  onTogglePlayback,
  onDismiss,
}: {
  state: AccessoryState;
  onTogglePlayback?: () => void;
  onDismiss?: () => void;
}) {
  const placement = useBottomAccessoryPlacement();

  if (state.type === "none") return null;

  // ==========================================
  // COMPACT INLINE MODE (When Keyboard Opens)
  // ==========================================
  if (placement === "inline") {
    switch (state.type) {
      case "nowPlaying":
        return (
          <Pressable onPress={state.onPress || onTogglePlayback} style={styles.inlineRow}>
            <Ionicons name={state.isPlaying ? "pause-circle" : "play-circle"} size={18} color="#6C5CE7" />
            <Text style={styles.inlineText} numberOfLines={1}>
              {state.title}
            </Text>
          </Pressable>
        );
      case "activeCall":
        return (
          <Pressable onPress={state.onPress} style={[styles.inlineRow, styles.inlineCall]}>
            <Ionicons name="call" size={14} color="#FFF" />
            <Text style={[styles.inlineText, { color: "#FFF" }]}>{formatDuration(state.durationSeconds)}</Text>
          </Pressable>
        );
      case "typing":
        return (
          <Pressable onPress={state.onPress} style={styles.inlineRow}>
            <Ionicons name="chatbubble-ellipses" size={16} color="#6C5CE7" />
            <Text style={styles.inlineText}>{state.name} is typing…</Text>
          </Pressable>
        );
      case "draftReply":
        return (
          <Pressable onPress={state.onPress} style={styles.inlineRow}>
            <Ionicons name="document-text" size={16} color="#F59E0B" />
            <Text style={styles.inlineText} numberOfLines={1}>
              Draft: {state.recipient}
            </Text>
          </Pressable>
        );
    }
  }

  // ==========================================
  // REGULAR MODE (Floating Pill Above Tabs)
  // ==========================================
  switch (state.type) {
    case "nowPlaying":
      return (
        <Pressable onPress={state.onPress} style={styles.floatingBar}>
          <View style={[styles.iconBox, { backgroundColor: "#F3E8FF" }]}>
            <Ionicons name="musical-notes" size={20} color="#6C5CE7" />
          </View>
          <View style={styles.regularTextBlock}>
            <Text style={styles.regularTitle} numberOfLines={1}>{state.title}</Text>
            <Text style={styles.regularSubtitle} numberOfLines={1}>{state.artist}</Text>
          </View>
          <Pressable onPress={onTogglePlayback} style={styles.actionCircle}>
            <Ionicons name={state.isPlaying ? "pause" : "play"} size={18} color="#FFF" />
          </Pressable>
        </Pressable>
      );

    case "activeCall":
      return (
        <Pressable onPress={state.onPress} style={[styles.floatingBar, styles.callBar]}>
          <View style={[styles.iconBox, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Ionicons name="call" size={20} color="#FFF" />
          </View>
          <View style={styles.regularTextBlock}>
            <Text style={[styles.regularTitle, { color: "#FFF" }]} numberOfLines={1}>
              {state.name}
            </Text>
            <Text style={[styles.regularSubtitle, { color: "#DCFCE7" }]}>
              {formatDuration(state.durationSeconds)}
            </Text>
          </View>
          <Pressable onPress={onDismiss} style={styles.endCallButton}>
            <Ionicons name="call" size={14} color="#FFF" style={{ transform: [{ rotate: "135deg" }] }} />
            <Text style={styles.endCallText}>End</Text>
          </Pressable>
        </Pressable>
      );

    case "typing":
      return (
        <Pressable onPress={state.onPress} style={styles.floatingBar}>
          <View style={[styles.iconBox, { backgroundColor: "#F3E8FF" }]}>
            <Ionicons name="chatbubble-ellipses" size={20} color="#6C5CE7" />
          </View>
          <View style={styles.regularTextBlock}>
            <Text style={styles.regularTitle} numberOfLines={1}>{state.name}</Text>
            <Text style={styles.regularSubtitle}>is typing a message…</Text>
          </View>
        </Pressable>
      );

    case "draftReply":
      return (
        <Pressable onPress={state.onPress} style={styles.floatingBar}>
          <View style={[styles.iconBox, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="document-text" size={20} color="#F59E0B" />
          </View>
          <View style={styles.regularTextBlock}>
            <Text style={styles.regularTitle} numberOfLines={1}>Draft to {state.recipient}</Text>
            <Text style={styles.regularSubtitle} numberOfLines={1}>{state.preview}</Text>
          </View>
          <Pressable onPress={onDismiss} style={styles.discardButton}>
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </Pressable>
        </Pressable>
      );
  }
}

function formatDuration(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  // --- Inline Compact Styles ---
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inlineCall: { backgroundColor: "#16A34A" },
  inlineText: { fontSize: 12, fontWeight: "700", color: "#1F2937" },

  // --- Regular Floating Pill Styles ---
  floatingBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    width: "90%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 28, // Matches the smooth pill aesthetic of your tab bar
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: Platform.OS === "ios" ? 1 : 0,
    borderColor: "#F3F4F6",
  },
  callBar: { backgroundColor: "#16A34A" },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  regularTextBlock: { flex: 1, marginRight: 8 },
  regularTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  regularSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 1 },

  // --- Action Buttons inside the Bar ---
  actionCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6C5CE7",
    alignItems: "center",
    justifyContent: "center",
  },
  endCallButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DC2626",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 4,
  },
  endCallText: { color: "#FFF", fontWeight: "700", fontSize: 12 },
  discardButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
});