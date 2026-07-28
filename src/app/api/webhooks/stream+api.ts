// import { Request, Response } from "expo-router/server";
import { sql } from "@/lib/db";
import { StreamChat } from "stream-chat";

const API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY!;
const SECRET_KEY = process.env.STREAM_SECRET_KEY!;
const client = StreamChat.getInstance(API_KEY, SECRET_KEY);

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature");

    // 1. Security: Verify the webhook actually came from Stream, not a hacker
    const isValid = client.verifyWebhook(rawBody, signature || "");
    if (!isValid) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // 2. Listen for when a video call or study room closes
    if (event.type === "call.ended" || event.type === "call.session_ended") {
      const callId = event.call_cid;
      const participants = event.call?.current_participants || [];

      // Update call stats duration
      await sql`
        UPDATE call_sessions
        SET status = 'completed', ended_at = CURRENT_TIMESTAMP
        WHERE id = ${callId} AND status = 'active';
      `;

      // 3. THE STREAK WRITE LOGIC: Increment streak for every participant in the call
      for (const participant of participants) {
        const userId = participant.user?.id;
        if (!userId) continue;

        await sql`
          INSERT INTO user_streaks (clerk_user_id, current_streak, last_active_date)
          VALUES (${userId}, 1, CURRENT_DATE)
          ON CONFLICT (clerk_user_id) 
          DO UPDATE SET 
            current_streak = CASE 
              -- If they studied yesterday, add +1 to their streak
              WHEN user_streaks.last_active_date = CURRENT_DATE - INTERVAL '1 day' 
              THEN user_streaks.current_streak + 1
              
              -- If they already studied today, keep the streak the same
              WHEN user_streaks.last_active_date = CURRENT_DATE 
              THEN user_streaks.current_streak
              
              -- If they skipped more than a day, reset their streak back to 1
              ELSE 1 
            END,
            last_active_date = CURRENT_DATE;
        `;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("[stream-webhook] Error:", error);
    return Response.json({ error: "Webhook failed" }, { status: 500 });
  }
}
