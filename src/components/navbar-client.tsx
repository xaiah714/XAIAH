"use client";

import { useState } from "react";
import Link from "next/link";
import { signOutAction } from "@/actions/sign-out";

type NavUser = {
  role: "STUDENT" | "TUTOR" | "ADMIN";
} | null;

/**
 * Minimal nav, one state per audience:
 *  - signed out: Homework Answers · Live Tutoring · Pricing | Help · Log in · [Ask a question]
 *  - student:    Homework Answers · Live Tutoring · Pricing | Help · Account · Sign out
 *  - tutor:      Homework Answers · Tutor Queue(badge) · Pricing | Help · Account · Sign out
 *  - admin:      Homework Answers · Live Tutoring · Admin | Help · Account · Sign out
 */
export function NavbarClient({ user, unreadCount }: { user: NavUser; unreadCount: number }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const links = (
    <>
      <Link href="/questions" className="hover:text-brand-teal" onClick={close}>
        Homework Answers
      </Link>
      {user?.role !== "TUTOR" && (
        <Link href={user ? "/chat" : "/pricing"} className="hover:text-brand-teal" onClick={close}>
          Live Tutoring
        </Link>
      )}
      {user?.role === "TUTOR" && (
        <Link href="/tutor" className="relative hover:text-brand-teal" onClick={close}>
          Tutor Queue
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-purple px-1 text-[10px] font-semibold text-white sm:absolute sm:-right-3 sm:-top-2 sm:ml-0">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      )}
      {user?.role === "ADMIN" ? (
        <Link href="/admin" className="hover:text-brand-teal" onClick={close}>
          Admin
        </Link>
      ) : (
        <Link href="/pricing" className="hover:text-brand-teal" onClick={close}>
          Pricing
        </Link>
      )}

      <span className="hidden flex-1 sm:block" />

      <Link href="/help" className="hover:text-brand-teal" onClick={close}>
        Help
      </Link>
      {user ? (
        <>
          <Link href="/account" className="hover:text-brand-teal" onClick={close}>
            Account
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="btn-secondary !px-4 !py-2 text-sm">
              Sign out
            </button>
          </form>
        </>
      ) : (
        <>
          <Link href="/login" className="hover:text-brand-teal" onClick={close}>
            Log in
          </Link>
          <Link href="/signup" className="btn-primary !px-4 !py-2 text-sm" onClick={close}>
            Ask a question
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      <nav className="hidden flex-1 items-center gap-4 pl-6 text-sm font-medium sm:flex">
        {links}
      </nav>

      <button
        type="button"
        className="flex items-center gap-1 rounded-lg border border-brand-border px-3 py-2 text-sm sm:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Toggle menu"
      >
        Menu
        {unreadCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-purple px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <nav className="mt-3 flex w-full flex-col gap-3 text-sm font-medium sm:hidden">
          {links}
        </nav>
      )}
    </>
  );
}
