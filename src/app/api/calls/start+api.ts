import { sql } from "@/lib/db";
import { verifyToken } from "@clerk/backend";
// import { Request, Response } from "expo-router/server";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    const authUserId = payload.sub;

    const body = await request.json();
    const { participantIds = [] } = body;

    // Insert a new active call session and return the generated UUID
    const [newCall] = await sql`
      INSERT INTO call_sessions (initiator_id, participant_ids, status, started_at)
      VALUES (${authUserId}, ${participantIds}, 'active', CURRENT_TIMESTAMP)
      RETURNING id, started_at;
    `;

    return Response.json({ success: true, callSessionId: newCall.id });
  } catch (error) {
    console.error("[call-start-api] Error:", error);
    return Response.json(
      { error: "Failed to start call session" },
      { status: 500 },
    );
  }
}
