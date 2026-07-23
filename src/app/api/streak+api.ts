import { sql } from "@/lib/db";
import { verifyToken } from "@clerk/backend";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return Response.json({ error: "missing token" }, { status: 401 });
  }

  let userId: string;
  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    userId = payload.sub;
  } catch {
    return Response.json({ error: "invalid token" }, { status: 401 });
  }

  const rows = await sql`
    select current_streak from user_streaks where clerk_user_id = ${userId}
  `;

  return Response.json({ streak: rows[0]?.current_streak ?? 0 });
}
