// lib/db.ts
import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.EXPO_PUBLIC_DATABASE_URL!);
