"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { endChatSessionAction } from "@/actions/chat";

type Message = {
  id: string;
  body: string;
  createdAt: string | Date;
  sender: { id: string; name: string; role: string };
};

type Status = "WAITING" | "ACTIVE" | "ENDED" | "CANCELLED";

export function ChatRoom({
  chatSessionId,
  currentUserId,
  initialMessages,
  initialStatus,
}: {
  chatSessionId: string;
  currentUserId: string;
  initialMessages: Message[];
  initialStatus: Status;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [status, setStatus] = useState<Status>(initialStatus);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastTimestamp = useRef<string | null>(
    initialMessages.at(-1)?.createdAt ? new Date(initialMessages.at(-1)!.createdAt).toISOString() : null
  );

  useEffect(() => {
    if (status === "ENDED" || status === "CANCELLED") return;

    const interval = setInterval(async () => {
      const url = new URL(`/api/chat/${chatSessionId}/messages`, window.location.origin);
      if (lastTimestamp.current) url.searchParams.set("since", lastTimestamp.current);

      const res = await fetch(url.toString());
      if (!res.ok) return;
      const data = await res.json();

      if (data.messages?.length) {
        setMessages((prev) => [...prev, ...data.messages]);
        lastTimestamp.current = data.messages.at(-1).createdAt;
      }
      if (data.status && data.status !== status) setStatus(data.status);
    }, 2500);

    return () => clearInterval(interval);
  }, [chatSessionId, status]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");

    const res = await fetch(`/api/chat/${chatSessionId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      lastTimestamp.current = data.message.createdAt;
    }
  }

  if (status === "ENDED" || status === "CANCELLED") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-brand-muted">This session has ended.</p>
        <Link href={`/chat/${chatSessionId}/rate`} className="btn-primary">
          Rate &amp; tip your tutor
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto rounded-xl border border-brand-border bg-brand-surface p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-brand-muted">
            {status === "WAITING" ? "Sit tight — matching you now." : "Say hello to get started."}
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                m.sender.id === currentUserId
                  ? "ml-auto bg-brand-teal text-white"
                  : "bg-brand-purple-light text-foreground"
              }`}
            >
              {m.body}
            </li>
          ))}
        </ul>
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex gap-2">
        <input
          className="input flex-1"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={status === "WAITING" ? "Waiting for a tutor..." : "Type a message"}
          disabled={status !== "ACTIVE"}
        />
        <button className="btn-primary !px-4" onClick={sendMessage} disabled={status !== "ACTIVE"}>
          Send
        </button>
      </div>

      {status === "ACTIVE" && (
        <button
          className="mt-2 self-start text-xs text-brand-muted underline"
          disabled={pending}
          onClick={() => startTransition(() => endChatSessionAction(chatSessionId))}
        >
          End session
        </button>
      )}
    </div>
  );
}
