"use client";

import { useState } from "react";
import Link from "next/link";
import { signOutAction } from "@/actions/sign-out";

type NavUser = {
  role: "STUDENT" | "TUTOR" | "ADMIN";
} | null;

export function NavbarClient({ user, unreadCount }: { user: NavUser; unreadCount: number }) {
  const [open, setOpen] = useState(false);

  const links = (
    <>
      <Link href="/questions" className="hover:text-brand-teal" onClick={() => setOpen(false)}>
        Community Q&amp;A
      </Link>
      {user && (
        <Link href="/chat" className="hover:text-brand-teal" onClick={() => setOpen(false)}>
          Live Chat
        </Link>
      )}
      {user?.role === "TUTOR" && (
        <Link
          href="/tutor"
          className="relative hover:text-brand-teal"
          onClick={() => setOpen(false)}
        >
          Tutor Queue
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-purple px-1 text-[10px] font-semibold text-white sm:absolute sm:-right-3 sm:-top-2 sm:ml-0">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      )}
      {user?.role === "ADMIN" && (
        <Link href="/admin" className="hover:text-brand-teal" onClick={() => setOpen(false)}>
          Admin
        </Link>
      )}
      {user ? (
        <>
          <Link href="/account" className="hover:text-brand-teal" onClick={() => setOpen(false)}>
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
          <Link href="/login" className="hover:text-brand-teal" onClick={() => setOpen(false)}>
            Log in
          </Link>
          <Link
            href="/signup"
            className="btn-primary !px-4 !py-2 text-sm"
            onClick={() => setOpen(false)}
          >
            Get help now
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      <nav className="hidden items-center gap-4 text-sm font-medium sm:flex">{links}</nav>

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
