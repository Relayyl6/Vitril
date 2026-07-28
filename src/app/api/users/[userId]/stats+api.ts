// import { ExpoRequest, ExpoResponse } from "expo-router/server";
import { sql } from "@/lib/db";
import { verifyToken } from "@clerk/backend";

interface UserStats {
  sessionsHosted: number;
  sessionsAttended: number;
  callMinutes: number;
  avgRating: number;
}

export async function GET(
  request: Request,
  { params }: { params: Record<string, string> },
) {
  try {
    // 1. Extract and verify the Clerk Bearer token sent from React Native
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return Response.json(
        { error: "Unauthorized: Missing Token" },
        { status: 401 },
      );
    }

    let authUserId: string;
    try {
      // Verifies the JWT signature using your Clerk Secret Key
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      authUserId = payload.sub;
    } catch (err) {
      return Response.json(
        { error: "Unauthorized: Invalid Token" },
        { status: 401 },
      );
    }

    const { userId } = params;

    // 2. Security: Ensure users can only query their own stats
    if (authUserId !== userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Perform high-performance SQL aggregations directly in Neon Postgres
    // (Assumes participant_ids is a Postgres TEXT[] array column)
    const [statsResult] = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE initiator_id = ${userId})::int AS sessions_hosted,
        COUNT(*) FILTER (WHERE initiator_id != ${userId} AND ${userId} = ANY(participant_ids))::int AS sessions_attended,
        COALESCE(
          SUM(EXTRACT(EPOCH FROM (ended_at - started_at)) / 60) FILTER (WHERE ended_at IS NOT NULL), 
          0
        )::int AS call_minutes
      FROM call_sessions
      WHERE initiator_id = ${userId} OR ${userId} = ANY(participant_ids);
    `;

    // 4. Compute average rating from call_ratings table
    const [ratingResult] = await sql`
      SELECT COALESCE(AVG(rating), 0)::float AS avg_rating
      FROM call_ratings
      WHERE target_user_id = ${userId};
    `;

    // 5. Format the response
    const stats: UserStats = {
      sessionsHosted: statsResult?.sessions_hosted ?? 0,
      sessionsAttended: statsResult?.sessions_attended ?? 0,
      callMinutes: statsResult?.call_minutes ?? 0,
      avgRating: Math.round((ratingResult?.avg_rating ?? 0) * 10) / 10,
    };

    return Response.json(stats, {
      headers: {
        "Cache-Control": "private, max-age=300", // Instructs frontend to cache for 5 min
      },
    });
  } catch (error) {
    console.error("[stats-api] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
