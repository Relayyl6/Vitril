// lib/sendPush.ts
export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
) {
  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      to: expoPushToken,
      title,
      body,
    }),
  });

  if (!response.ok) {
    throw new Error(`Push API error: ${response.status}`);
  }

  return response.json();
}
