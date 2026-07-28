// import { Request, Response } from "expo-router/server";
import { sql } from "@/lib/db";
import { verifyToken } from "@clerk/backend";

// Helper to authenticate incoming mobile requests
async function authenticateRequest(request: Request, targetUserId: string) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) throw new Error("Unauthorized");

  const payload = await verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  if (payload.sub !== targetUserId) throw new Error("Forbidden");
  return payload.sub;
}

/**
 * GET /api/users/[userId]/presence
 * Fetches the current presence status of a user
 */
export async function GET(
  request: Request,
  { params }: { params: Record<string, string> },
) {
  try {
    const { userId } = params;

    const [userPresence] = await sql`
        SELECT 
            CASE 
            -- If the mobile app hasn't pinged us in 2 minutes, force status to 'offline'
            WHEN last_seen < CURRENT_TIMESTAMP - INTERVAL '2 minutes' THEN 'offline'::presence_status
            ELSE status 
            END AS effective_status,
            last_seen 
        FROM user_presence 
        WHERE user_id = ${userId};
        `;

    if (!userPresence) {
      return Response.json({
        userId,
        status: "offline",
        lastSeen: new Date().toISOString(),
      });
    }

    return Response.json({
      userId,
      status: userPresence?.effective_status ?? "offline",
      lastSeen: userPresence?.last_seen ?? new Date().toISOString(),
    });
  } catch (error) {
    console.error("[presence-api-GET] Error:", error);
    return Response.json(
      { error: "Failed to fetch presence" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/users/[userId]/presence
 * Upserts user presence status from background heartbeats or manual toggles
 */
export async function POST(
  request: Request,
  { params }: { params: Record<string, string> },
) {
  try {
    const { userId } = params;
    await authenticateRequest(request, userId);

    const body = await request.json();
    const { status } = body;

    if (!status || !["online", "away", "dnd", "offline"].includes(status)) {
      return Response.json(
        { error: "Invalid presence status" },
        { status: 400 },
      );
    }

    // Upsert into Neon Postgres: insert new row or update existing timestamp/status
    await sql`
      INSERT INTO user_presence (user_id, status, last_seen)
      VALUES (${userId}, ${status}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        status = EXCLUDED.status,
        last_seen = CURRENT_TIMESTAMP;
    `;

    return Response.json({ success: true, userId, status });
  } catch (error: any) {
    const status =
      error.message === "Unauthorized"
        ? 401
        : error.message === "Forbidden"
          ? 403
          : 500;
    return Response.json(
      { error: error.message || "Internal Server Error" },
      { status },
    );
  }
}
