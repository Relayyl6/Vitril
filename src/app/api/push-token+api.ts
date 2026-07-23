import { sql } from "@/lib/db";
import { verifyToken } from "@clerk/backend";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return Response.json({ error: "missing token" }, { status: 401 });

  let userId: string;
  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    userId = payload.sub;
  } catch {
    return Response.json({ error: "invalid token" }, { status: 401 });
  }

  const { expoPushToken } = await req.json();
  if (!expoPushToken)
    return Response.json({ error: "missing push token" }, { status: 400 });

  await sql`
    insert into user_push_tokens (clerk_user_id, expo_push_token)
    values (${userId}, ${expoPushToken})
    on conflict (clerk_user_id)
    do update set expo_push_token = ${expoPushToken}, updated_at = now()
  `;

  return Response.json({ saved: true });
}
