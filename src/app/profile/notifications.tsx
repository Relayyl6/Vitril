import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View
} from "react-native";
// Adjust this import path based on where your hooks folder is located
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function NotificationsScreen() {
  const { expoPushToken, permissionStatus, requestPermissions } =
    usePushNotifications();

  return (
    <ScrollView className="flex-1 bg-white px-5 py-6">
      <View className="mb-6 items-center justify-center py-4">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-blue-50 mb-3">
          <Ionicons name="notifications" size={32} color="#3B82F6" />
        </View>
        <Text className="text-xl font-bold text-gray-900">
          Push Notifications
        </Text>
        <Text className="text-sm text-gray-500 text-center mt-2">
          Stay updated on your study history, saved resources, and incoming
          messages.
        </Text>
      </View>

      {/* Status Card */}
      <View className="mb-6 rounded-2xl bg-gray-50 p-5 border border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-base font-semibold text-gray-900">
            Current Status
          </Text>
          <View
            className={`px-3 py-1 rounded-full ${permissionStatus === "granted" ? "bg-green-100" : "bg-yellow-100"}`}
          >
            <Text
              className={`text-xs font-bold uppercase ${permissionStatus === "granted" ? "text-green-700" : "text-yellow-700"}`}
            >
              {permissionStatus || "Checking..."}
            </Text>
          </View>
        </View>

        {permissionStatus === "granted" ? (
          <View>
            <Text className="text-sm text-gray-600 mb-2">
              Device Token (Synced to Database):
            </Text>
            <View className="bg-gray-200 rounded-lg p-3">
              <Text className="text-xs text-gray-800" selectable>
                {expoPushToken || "Generating token..."}
              </Text>
            </View>
          </View>
        ) : (
          <View>
            <Text className="text-sm text-gray-600 mb-4">
              Push notifications are currently disabled. Enable them to receive
              real-time alerts.
            </Text>
            <Pressable
              onPress={requestPermissions}
              className="flex-row items-center justify-center bg-blue-500 rounded-xl py-3 px-4 active:bg-blue-600"
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="white"
                className="mr-2"
              />
              <Text className="text-white font-semibold text-base ml-2">
                Enable Notifications
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Information Section */}
      <View className="px-2">
        <Text className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
          How it works
        </Text>
        <View className="flex-row items-start mb-4">
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color="#9CA3AF"
            className="mt-0.5"
          />
          <Text className="text-sm text-gray-600 ml-3 flex-1">
            Your token is securely linked to your account using Clerk
            authentication.
          </Text>
        </View>
        <View className="flex-row items-start">
          <Ionicons
            name="sync-outline"
            size={20}
            color="#9CA3AF"
            className="mt-0.5"
          />
          <Text className="text-sm text-gray-600 ml-3 flex-1">
            If you log in on a new device, a new token will automatically be
            generated and synced.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
