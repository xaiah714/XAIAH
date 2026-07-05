import { requireUser } from "@/lib/auth-helpers";
import { PendingChatWaiter } from "./pending-chat-waiter";

export default async function ChatPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout_session_id?: string }>;
}) {
  await requireUser();
  const { checkout_session_id } = await searchParams;

  if (!checkout_session_id) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p>Missing checkout session.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Setting up your session...</h1>
      <p className="mt-2 text-sm text-brand-muted">
        Payment confirmed — matching you with a tutor now.
      </p>
      <PendingChatWaiter checkoutSessionId={checkout_session_id} />
    </div>
  );
}
