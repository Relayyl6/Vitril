import { sql } from "@/lib/db";
import { sendPushNotification } from "@/lib/sendPush";

export async function POST(req: Request) {
  console.log("Expected:", process.env.CRON_SECRET);
  console.log("Got:", req.headers.get("authorization"));
  // simple shared-secret check so randoms on the internet can't trigger this
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  // find users who were active yesterday but NOT yet today —
  // i.e. their streak is alive but about to break if they don't act
  const atRiskUsers = await sql`
    select s.clerk_user_id, s.current_streak, t.expo_push_token
    from user_streaks s
    join user_push_tokens t on t.clerk_user_id = s.clerk_user_id
    where s.last_active_date = current_date - interval '1 day'
  `;

  let sent = 0;
  for (const row of atRiskUsers) {
    try {
      await sendPushNotification(
        row.expo_push_token,
        "Don't lose your streak! 🔥",
        `You're on a ${row.current_streak} day streak — study today to keep it alive.`,
      );
      sent++;
    } catch (err) {
      console.warn(`Failed to notify ${row.clerk_user_id}`, err);
    }
  }

  return Response.json({ checked: atRiskUsers.length, sent });
}
