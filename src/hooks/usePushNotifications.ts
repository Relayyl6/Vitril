// hooks/usePushNotifications.ts
import { useAuth } from "@clerk/expo";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function usePushNotifications() {
  const { getToken } = useAuth(); // ← ADD this line

  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<Notifications.PermissionStatus | null>(null);

  const notifListener = useRef<Notifications.EventSubscription | undefined>(
    undefined,
  );
  const responseListener = useRef<Notifications.EventSubscription | undefined>(
    undefined,
  );

  useEffect(() => {
    checkPermissions();

    notifListener.current = Notifications.addNotificationReceivedListener((n) =>
      console.log("Notification received:", n),
    );
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((r) =>
        console.log("Notification tapped:", r),
      );

    return () => {
      notifListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
    if (status === "granted") {
      setExpoPushToken(await registerForPushNotifications());
    }
  };

  const registerForPushNotifications = async () => {
    if (!Device.isDevice) {
      console.warn("Push notifications require a physical device");
      return null;
    }
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });

    // NEW: save this push token to our database, tied to the signed-in user
    try {
      const authToken = await getToken();
      await fetch("/api/push-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ expoPushToken: data }),
      });
    } catch (err) {
      console.warn("Failed to save push token", err);
    }

    return data;
  };

  const requestPermissions = async () => {
    const { status: current } = await Notifications.getPermissionsAsync();
    let finalStatus = current;
    if (current !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    setPermissionStatus(finalStatus);
    if (finalStatus === "granted") {
      setExpoPushToken(await registerForPushNotifications());
      return true;
    }
    return false;
  };

  return { expoPushToken, permissionStatus, requestPermissions };
}
