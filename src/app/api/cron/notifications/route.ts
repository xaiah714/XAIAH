import { NextRequest, NextResponse } from "next/server";
import { runNotificationSweep } from "@/lib/notifications/scheduler";

// Intended to be invoked by an external scheduler (Vercel Cron, GitHub
// Actions, etc.) roughly once a day. Protected by a shared secret so it
// can't be triggered by anyone who finds the URL.
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await runNotificationSweep();
  return NextResponse.json({ ok: true, summary });
}
