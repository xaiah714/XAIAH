import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-950">Sign in to ScholarMatch</h1>
        <p className="mt-2 text-sm text-slate-500">
          One verified account, no duplicates — real students, real matches.
        </p>
      </div>

      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/dashboard" });
        }}
      >
        <button
          type="submit"
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
        >
          Continue with Google
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        or
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form
        action={async (formData: FormData) => {
          "use server";
          await signIn("email", formData);
        }}
        className="space-y-3"
      >
        <input type="hidden" name="redirectTo" value="/dashboard" />
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            name="email"
            required
            placeholder="you@school.edu"
            className="input mt-1"
          />
        </label>
        <button
          type="submit"
          className="min-h-[48px] w-full rounded-full bg-brand-600 px-6 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Continue with email
        </button>
        <p className="text-xs text-slate-500">
          We&apos;ll email you a link — no password needed. Clicking it verifies your account.
        </p>
      </form>
    </main>
  );
}
