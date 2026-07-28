import { PROFILE_SECTIONS_DATA } from "@/lib/profileSectionsData";
import { COLORS } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DynamicProfileSectionScreen() {
  const router = useRouter();
  // Grab the dynamic [section] variable from the URL (e.g., "history")
  const { section } = useLocalSearchParams<{ section: string }>();

  // Look up the data matching this section slug
  const sectionData = section
    ? PROFILE_SECTIONS_DATA[section.toLowerCase()]
    : null;

  if (!sectionData) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center px-5">
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={COLORS.textMuted}
        />
        <Text className="text-foreground font-bold text-lg mt-2">
          Section Not Found
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 bg-surface px-4 py-2 rounded-xl border border-border"
        >
          <Text className="text-foreground">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Top Navigation Bar */}
      <View className="px-5 py-3 flex-row items-center gap-3 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-1 -ml-1">
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text className="text-xl font-bold text-foreground">
          {sectionData.title}
        </Text>
      </View>

      {/* Description Header */}
      <View className="px-5 py-4 bg-surface/50">
        <Text className="text-sm text-foreground-muted leading-5">
          {sectionData.description}
        </Text>
      </View>

      {/* Dynamic List Feed */}
      <FlatList
        data={sectionData.items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, gap: 12 }}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between p-4 rounded-2xl bg-surface border border-border">
            <View className="flex-1 mr-3">
              <Text className="text-base font-semibold text-foreground">
                {item.title}
              </Text>
              {item.subtitle && (
                <Text className="text-xs text-foreground-muted mt-1">
                  {item.subtitle}
                </Text>
              )}
            </View>

            <View className="items-end gap-1">
              {item.badge && (
                <View className="bg-primary/10 px-2.5 py-1 rounded-full">
                  <Text className="text-xs font-bold text-primary">
                    {item.badge}
                  </Text>
                </View>
              )}
              {item.date && (
                <Text className="text-[10px] text-foreground-muted">
                  {item.date}
                </Text>
              )}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
