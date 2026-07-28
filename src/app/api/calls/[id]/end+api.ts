import { sql } from "@/lib/db";
import { verifyToken } from "@clerk/backend";
// import { Request, Response } from "expo-router/server";

export async function POST(
  request: Request,
  { params }: { params: Record<string, string> },
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    const { id: callSessionId } = params;

    // Update the session to 'completed' and stamp the end time
    const [updatedCall] = await sql`
      UPDATE call_sessions
      SET status = 'completed', ended_at = CURRENT_TIMESTAMP
      WHERE id = ${callSessionId} AND status = 'active'
      RETURNING id, started_at, ended_at;
    `;

    if (!updatedCall) {
      return Response.json(
        { error: "Call session not found or already closed" },
        { status: 404 },
      );
    }

    return Response.json({ success: true, call: updatedCall });
  } catch (error) {
    console.error("[call-end-api] Error:", error);
    return Response.json(
      { error: "Failed to end call session" },
      { status: 500 },
    );
  }
}
