import { NextResponse } from "next/server";
import { sweepUnansweredQuestions } from "@/lib/question-sweep";

// Meant to run every few minutes (Vercel Cron sends CRON_SECRET as the
// bearer token automatically when the env var is set).
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await sweepUnansweredQuestions();
  return NextResponse.json({ ranAt: new Date().toISOString(), results });
}
