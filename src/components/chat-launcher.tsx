import { auth } from "@/auth";
import { ChatLauncherClient } from "./chat-launcher-client";

/**
 * Floating 24/7 live-chat button pinned bottom-right on every page.
 * Signed-out → sign-in prompt; student → straight into the live chat
 * request flow; tutor/admin → the live chat queue.
 */
export async function ChatLauncher() {
  const session = await auth();
  const role = session?.user?.role ?? null;
  const href = role === null ? "/login" : role === "STUDENT" ? "/chat/new" : "/chat";
  const label = role === null ? "Sign in for 24/7 live tutor chat" : "24/7 live tutor chat";
  return <ChatLauncherClient href={href} label={label} />;
}
