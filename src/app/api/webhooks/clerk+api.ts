import { sql } from "@/lib/db";
import { Webhook } from "svix";

async function updateStreak(userId: string) {
  const rows = await sql`
    select distinct date(created_at) as day
    from user_sessions
    where clerk_user_id = ${userId}
    order by day desc
    limit 60
  `;

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const row of rows) {
    const day = new Date(row.day as string);
    day.setHours(0, 0, 0, 0);
    const diffDays = Math.round((cursor.getTime() - day.getTime()) / 86400000);

    if (diffDays === 0 || diffDays === 1) {
      streak++;
      cursor = day;
    } else {
      break;
    }
  }

  await sql`
    insert into user_streaks (clerk_user_id, current_streak, last_active_date)
    values (${userId}, ${streak}, current_date)
    on conflict (clerk_user_id)
    do update set current_streak = ${streak}, last_active_date = current_date, updated_at = now()
  `;
}

export async function POST(req: Request) {
  const rawBody = await req.text(); // must be the untouched raw text, not JSON-parsed

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SIGNING_SECRET!);

  let evt: any;
  try {
    evt = wh.verify(rawBody, {
      "svix-id": req.headers.get("svix-id") ?? "",
      "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
      "svix-signature": req.headers.get("svix-signature") ?? "",
    });
  } catch (err) {
    return Response.json({ error: "invalid signature" }, { status: 400 });
  }

  if (evt.type === "session.created") {
    const { user_id, id: session_id } = evt.data;

    await sql`
      insert into user_sessions (clerk_user_id, session_id)
      values (${user_id}, ${session_id})
    `;

    await updateStreak(user_id);
  }

  return Response.json({ received: true });
}
