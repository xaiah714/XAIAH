import { NextResponse } from "next/server";
import { sweepUnansweredQuestions } from "@/lib/question-sweep";

// Manual trigger for the sweep (the deployed cron-worker service runs it
// every 5 minutes on its own — see scripts/cron-worker.ts).
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await sweepUnansweredQuestions();
  return NextResponse.json({ ranAt: new Date().toISOString(), results });
}
