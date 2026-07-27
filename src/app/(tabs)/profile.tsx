import { MENU_ITEMS } from "@/constants";
import { useAlertActions } from "@/context/AlertContext";
import { COLORS } from "@/lib/theme";
import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as Sentry from "@sentry/react-native";
import { Image } from "expo-image";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePushNotifications } from "../../hooks/usePushNotifications";
import { useStudyStreak } from "../../hooks/useStudyStreak";
import { scheduleDailyReminder } from "../../lib/notification";

const Profile = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { permissionStatus, requestPermissions } = usePushNotifications();
  const streak = useStudyStreak();
  const { show } = useAlertActions();

  const subscribeToNotifications = permissionStatus === "granted";

  const handleToggleNotifications = async () => {
    if (subscribeToNotifications) {
      Linking.openSettings();
    } else {
      const granted = await requestPermissions();
      if (granted) {
        await scheduleDailyReminder();
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <View className="px-5 py-3 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-foreground">Profile</Text>
          <Pressable
            onPress={handleToggleNotifications}
            className="items-center justify-center"
          >
            <Ionicons
              name={
                subscribeToNotifications
                  ? "notifications"
                  : "notifications-circle-outline"
              }
              size={subscribeToNotifications ? 20 : 24}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        {/* Profile Card */}
        <View className="items-center py-5">
          <View className="mb-3.5 relative">
            <Image
              source={user?.imageUrl}
              alt="avatar"
              style={{ width: 88, height: 88, borderRadius: 44 }}
              contentFit="contain"
            />
            <View className="absolute bottom-[2px] right-[2px] h-[22px] w-[22px] rounded-[9px] bg-accent-secondary border-[3px] border-background" />
          </View>

          <Text className="text-2xl font-bold text-foreground">
            {user?.fullName || user?.username || "Student"}
          </Text>
          <Text className="mt-0.5 text-base font-semibold text-foreground-muted">
            {user?.primaryEmailAddress?.emailAddress}
          </Text>

          <View className="mt-3 flex-row items-center gap-1.5 rounded-full bg-[#FDCB6E1E] px-3.5 py-1.5">
            <Ionicons name="flame" size={16} color="#FDCB6E" />
            <Text className="text-sm font-semibold text-[#FDCB6E]">
              {streak} day study streak
            </Text>
          </View>
        </View>

        {/* Proile stats */}
        <View className="mt-2 mb-6 flex-row gap-6 px-5">
          <View className="flex-1 items-center rounded-2xl border border-border bg-surface px-4 py-4">
            <Text className="text-2xl font-bold text-primary">24</Text>
            <Text className="mt-1 text-xs text-foreground-muted">Sessions</Text>
          </View>

          <View className="flex-1 items-center rounded-2xl border border-border bg-surface px-4 py-4">
            <Text className="text-2xl font-bold text-primary">12</Text>
            <Text className="mt-1 text-xs text-foreground-muted">Partners</Text>
          </View>

          <View className="flex-1 items-center rounded-2xl border border-border bg-surface px-4 py-4">
            <Text className="text-2xl font-bold text-primary">48h</Text>
            <Text className="mt-1 text-xs text-foreground-muted">
              Study Time
            </Text>
          </View>
        </View>

        {/* Profile Menu Items */}
        <View className="gap-3 px-5">
          {MENU_ITEMS.map((item, i) => (
            <Pressable
              key={i}
              className="mb-1.5 flex-row items-center gap-3.5 rounded-xl border border-border bg-surface px-4 py-4"
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${item.color}15` }}
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={item.color}
                />
              </View>
              <Text className="flex-1 text-base font-medium text-foreground">
                {item.label}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLORS.textSubtle}
              />
            </Pressable>
          ))}
        </View>

        {/* Sign out button */}
        <Pressable
          className="mt-6 mx-5 flex-row items-center justify-center gap-2 rounded-xl border border-[#FF6B6B] bg-surface px-4 py-4"
          onPress={async () => {
            try {
              await signOut();
              Sentry.logger.info("User signed out successfully", {
                userId: user?.id,
              });
              show(
                "You've successfully signed out",
                "Leaving so soon from Vitril? ",
                "success",
              );
            } catch (error) {
              Sentry.logger.error("Error Signing Out", {
                error,
                userId: user?.id,
              });
              Sentry.captureException(error);
              show(
                "Error",
                "An error occured while signing out. Please try again.",
                "error",
              );
            }
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text className="text-base font-semibold text-danger">Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
