import { requireRole } from "@/lib/auth-helpers";
import { StartChatForm } from "./start-chat-form";

export default async function NewChatPage() {
  await requireRole("STUDENT");

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold">Start live chat</h1>
      <p className="mt-1 text-sm text-brand-muted">
        We&apos;ll match you with a tutor who&apos;s awake and available right now.
      </p>
      <div className="card mt-6">
        <StartChatForm />
      </div>
    </div>
  );
}
