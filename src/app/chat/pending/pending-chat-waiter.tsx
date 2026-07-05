"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function PendingChatWaiter({ checkoutSessionId }: { checkoutSessionId: string }) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (attempts > 20) return;

    const timer = setTimeout(async () => {
      const res = await fetch(`/api/chat/pending?checkout_session_id=${checkoutSessionId}`);
      const data = await res.json();
      if (data.chatSessionId) {
        router.push(`/chat/${data.chatSessionId}`);
      } else {
        setAttempts((n) => n + 1);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [attempts, checkoutSessionId, router]);

  if (attempts > 20) {
    return (
      <p className="mt-4 text-sm text-red-600">
        This is taking longer than expected. Check{" "}
        <Link href="/chat" className="underline">
          your chat list
        </Link>{" "}
        in a moment.
      </p>
    );
  }

  return <div className="mt-6 animate-pulse text-sm text-brand-muted">Just a moment...</div>;
}
