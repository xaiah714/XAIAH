import Link from "next/link";
import { auth } from "@/auth";
import { signOutAction } from "@/actions/sign-out";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-10 border-b border-brand-border bg-brand-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-brand-teal-dark">
          TutorApp
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/questions" className="hover:text-brand-teal">
            Community Q&amp;A
          </Link>
          {user && (
            <Link href="/chat" className="hover:text-brand-teal">
              Live Chat
            </Link>
          )}
          {user?.role === "TUTOR" && (
            <Link href="/tutor" className="hover:text-brand-teal">
              Tutor Queue
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="hover:text-brand-teal">
              Admin
            </Link>
          )}

          {user ? (
            <>
              <Link href="/account" className="hover:text-brand-teal">
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
              <Link href="/login" className="hover:text-brand-teal">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary !px-4 !py-2 text-sm">
                Get help now
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
