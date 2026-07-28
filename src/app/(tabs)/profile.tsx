import { MENU_ITEMS } from "@/constants";
import { useAlertActions } from "@/context/AlertContext";
import { useProfileStats } from "@/hooks/useProfileStats";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useStudyStreak } from "@/hooks/useStudyStreak";
import { useUserPresence } from "@/hooks/useUserPresence";
import { scheduleDailyReminder } from "@/lib/notification";
import { COLORS } from "@/lib/theme";
import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as Sentry from "@sentry/react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const { signOut } = useAuth();
  const router = useRouter();
  const { user } = useUser();
  const { permissionStatus, requestPermissions } = usePushNotifications();
  const streak = useStudyStreak();
  const stats = useProfileStats(); // Fetch real stats from API
  const { presence, setPresence } = useUserPresence(); // Manage presence state
  const { show } = useAlertActions();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState(user?.fullName || "");

  const subscribeToNotifications = permissionStatus === "granted";

  const handleToggleNotifications = useCallback(async () => {
    try {
      if (subscribeToNotifications) {
        Linking.openSettings();
      } else {
        const granted = await requestPermissions();
        if (granted) {
          await scheduleDailyReminder();
          show(
            "Notifications enabled",
            "You'll receive daily study reminders.",
            "success",
          );
        }
      }
    } catch (error) {
      Sentry.captureException(error);
      show("Error", "Failed to update notification settings.", "error");
    }
  }, [subscribeToNotifications, requestPermissions, show]);

  const handleChangePresence = useCallback(
    async (newPresence: "online" | "away" | "dnd") => {
      try {
        await setPresence(newPresence);
        const messages = {
          online: "You're online",
          away: "You're away",
          dnd: "Do not disturb enabled",
        };
        show(messages[newPresence], "", "success");
      } catch (error) {
        Sentry.captureException(error);
        show("Error", "Failed to update presence status.", "error");
      }
    },
    [setPresence, show],
  );

  const handleSignOut = useCallback(async () => {
    try {
      await setPresence("offline");
      await signOut();
      Sentry.logger.info("User signed out successfully", {
        userId: user?.id,
      });
      show(
        "You've successfully signed out",
        "Leaving so soon from Vitril?",
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
        "An error occurred while signing out. Please try again.",
        "error",
      );
    }
  }, [setPresence, signOut, show, user?.id]);

  const handleUpdateProfile = useCallback(async () => {
    try {
      if (editedName.trim().length === 0) {
        show("Error", "Name cannot be empty.", "error");
        return;
      }

      // TODO: Call API to update user profile
      // await updateUserProfile({ fullName: editedName });

      setIsEditingProfile(false);
      show("Profile updated", "Your changes have been saved.", "success");
    } catch (error) {
      Sentry.captureException(error);
      show("Error", "Failed to update profile.", "error");
    }
  }, [editedName, show]);

  const getPresenceColor = useCallback((presenceStatus: string) => {
    switch (presenceStatus) {
      case "online":
        return "#10B981";
      case "away":
        return "#F59E0B";
      case "dnd":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header with notification toggle */}
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

        {/* Profile Card with Avatar and Presence */}
        <View className="items-center py-5">
          <View className="mb-3.5 relative">
            <Image
              source={user?.imageUrl}
              alt="avatar"
              style={{ width: 88, height: 88, borderRadius: 44 }}
              contentFit="contain"
            />
            {/* Presence Indicator Dot */}
            <View
              className="absolute bottom-[2px] right-[2px] h-[22px] w-[22px] rounded-[9px] bg-accent-secondary border-[3px] border-background"
              style={{
                backgroundColor: getPresenceColor(presence),
                opacity: 0.9,
              }}
            />
          </View>

          {isEditingProfile ? (
            <View className="w-full px-5 gap-2">
              <View className="bg-surface rounded-lg border border-border px-3 py-2">
                <TextInput
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="Enter your name"
                  className="text-foreground text-base"
                />
              </View>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={handleUpdateProfile}
                  className="flex-1 bg-accent rounded-lg py-2 items-center justify-center"
                >
                  <Text className="text-white font-semibold">Save</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setIsEditingProfile(false);
                    setEditedName(user?.fullName || "");
                  }}
                  className="flex-1 bg-surface rounded-lg border border-border py-2 items-center justify-center"
                >
                  <Text className="text-foreground font-semibold">Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <Pressable onPress={() => setIsEditingProfile(true)}>
                <Text className="text-2xl font-bold text-foreground">
                  {user?.fullName || user?.username || "Student"}
                </Text>
              </Pressable>
              <Text className="mt-0.5 text-base font-semibold text-foreground-muted">
                {user?.primaryEmailAddress?.emailAddress}
              </Text>
            </>
          )}

          {/* Streak Badge */}
          <View className="mt-3 flex-row items-center gap-1.5 rounded-full bg-[#FDCB6E1E] px-3.5 py-1.5">
            <Ionicons name="flame" size={16} color="#FDCB6E" />
            <Text className="text-sm font-semibold text-[#FDCB6E]">
              {streak} day study streak
            </Text>
          </View>

          {/* Presence Status Selector */}
          <View className="mt-4 flex-row gap-2">
            {["online", "away", "dnd"].map((status) => (
              <Pressable
                key={status}
                onPress={() =>
                  handleChangePresence(status as "online" | "away" | "dnd")
                }
                className={`px-3 py-1.5 rounded-full border ${
                  presence === status
                    ? "bg-accent border-accent"
                    : "border-border bg-surface"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    presence === status ? "text-white" : "text-foreground"
                  }`}
                >
                  {status === "dnd" ? "DND" : status}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Profile Stats (Real Data) */}
        <View className="mt-2 mb-6 flex-row gap-6 px-5">
          <View className="flex-1 items-center rounded-2xl border border-border bg-surface px-4 py-4">
            <Text className="text-2xl font-bold text-primary">
              {stats?.sessionsHosted || 0}
            </Text>
            <Text className="mt-1 text-xs text-foreground-muted">Sessions</Text>
          </View>

          <View className="flex-1 items-center rounded-2xl border border-border bg-surface px-4 py-4">
            <Text className="text-2xl font-bold text-primary">
              {stats?.callMinutes ? Math.round(stats.callMinutes / 60) : 0}
            </Text>
            <Text className="mt-1 text-xs text-foreground-muted">
              Call Hours
            </Text>
          </View>

          <View className="flex-1 items-center rounded-2xl border border-border bg-surface px-4 py-4">
            <Text className="text-2xl font-bold text-primary">
              {stats?.avgRating?.toFixed(1) || "N/A"}
            </Text>
            <Text className="mt-1 text-xs text-foreground-muted">
              Avg Rating
            </Text>
          </View>
        </View>

        {/* Menu Items with Handlers */}
        <View className="gap-3 px-5">
          {MENU_ITEMS.map((item, i) => (
            <Pressable
              key={i}
              onPress={() => {
                // Route based on item.action or item.id
                // Example: handleMenuItemPress(item);
                if (item.id) {
                  router.push(`/profile/${item.id.toLowerCase()}`);
                } else {
                  show(
                    "Coming soon",
                    `${item.label} feature coming soon`,
                    "info",
                  );
                }
              }}
              className="mb-1.5 flex-row items-center gap-3.5 rounded-xl border border-border bg-surface px-4 py-4 active:opacity-70"
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

        {/* Sign Out Button */}
        <Pressable
          className="mt-6 mx-5 flex-row items-center justify-center gap-2 rounded-xl border border-[#FF6B6B] bg-surface px-4 py-4 active:opacity-70"
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text className="text-base font-semibold text-danger">Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
