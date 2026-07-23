import * as Notifications from "expo-notifications";

export async function scheduleDailyReminder() {
  // clear any previously scheduled one first to avoid duplicates
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to study!✨",
      body: "Keep your streak alive — jump back in for today.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 18,
      minute: 0,
    },
  });
}
