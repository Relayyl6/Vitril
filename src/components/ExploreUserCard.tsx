import { COLORS } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import type { UserResponse } from "stream-chat";

type ExploreUserCardProps = {
  item: UserResponse;
  creating: string | null;
  onStartChat: (targetId: string) => void;
  onStartCall?: (targetId: string) => void; // optional until call flow is wired
};

const ExploreUserCard = ({
  item,
  creating,
  onStartChat,
  onStartCall,
}: ExploreUserCardProps) => {
  const isCreatingThis = creating === item.id;
  const isDisabled = creating !== null;
  const displayName = item.name || item.id;

  return (
    <Pressable
      onPress={() => onStartChat(item.id)}
      disabled={isDisabled}
      style={({ pressed }) => ({ opacity: pressed && !isDisabled ? 0.7 : 1 })}
      className="flex-row items-center bg-surface rounded-2xl p-3.5 mb-2.5 border border-border gap-3.5"
      accessibilityRole="button"
      accessibilityLabel={`Start chat with ${displayName}`}
    >
      <View className="relative">
        {item.image ? (
          <Image
            source={item.image}
            style={{ width: 48, height: 48, borderRadius: 24 }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{ width: 48, height: 48, borderRadius: 24 }}
            className="items-center justify-center bg-background border border-border"
          >
            <Text className="text-base font-bold text-foreground">
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {item.online && (
          <View className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-accent-secondary border-2 border-surface" />
        )}
      </View>

      {/* user info */}
      <View className="flex-1">
        <Text
          className="text-base font-semibold text-foreground"
          numberOfLines={1}
        >
          {displayName}
        </Text>
        <Text className="text-xs text-foreground-muted mt-0.5">
          {item.online ? "Online" : "Offline"}
        </Text>
      </View>

      {/* actions */}
      {isCreatingThis ? (
        <ActivityIndicator size="small" color={COLORS.primary} />
      ) : (
        <View className="flex-row gap-2">
          {onStartCall && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onStartCall(item.id);
              }}
              disabled={isDisabled}
              hitSlop={6}
              className="w-9 h-9 rounded-xl bg-accent-secondary/20 justify-center items-center"
              accessibilityRole="button"
              accessibilityLabel={`Call ${displayName}`}
            >
              <Ionicons
                name="videocam"
                size={17}
                color={COLORS.accentSecondary ?? COLORS.primary}
              />
            </Pressable>
          )}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onStartChat(item.id);
            }}
            disabled={isDisabled}
            hitSlop={6}
            className="w-9 h-9 rounded-xl bg-primary/20 justify-center items-center"
            accessibilityRole="button"
            accessibilityLabel={`Chat with ${displayName}`}
          >
            <Ionicons name="chatbubble" size={16} color={COLORS.primary} />
          </Pressable>
        </View>
      )}
    </Pressable>
  );
};

export default ExploreUserCard;
