"use client";

import { useActionState, useState } from "react";
import { contactAction, type ContactFormState } from "@/actions/contact";

const initialState: ContactFormState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(contactAction, initialState);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  if (state.success) {
    return (
      <p className="rounded-xl bg-brand-teal-light px-4 py-3 text-sm text-brand-teal-dark">
        Got it — thanks! We&apos;ll get back to you at {email || "your email"}.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <label htmlFor="contact-email" className="text-sm font-medium">
          Your email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          className="input mt-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="text-sm font-medium">
          What&apos;s going on?
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={5}
          className="input mt-1"
          placeholder="Bug reports, questions, ideas — all welcome."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" className="btn-primary self-start" disabled={pending}>
        {pending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
