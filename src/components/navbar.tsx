import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NavbarClient } from "@/components/navbar-client";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  const unreadCount =
    user?.role === "TUTOR"
      ? await prisma.notification.count({ where: { userId: user.id, read: false } })
      : 0;

  return (
    <header className="sticky top-0 z-10 border-b border-brand-border bg-brand-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-brand-teal-dark">
          TutorApp
        </Link>
        <NavbarClient user={user ?? null} unreadCount={unreadCount} />
      </div>
    </header>
  );
}
