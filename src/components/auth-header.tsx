import { auth, signOut } from "@/auth";

export default async function AuthHeader() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <div className="flex items-center justify-end gap-3 px-6 pt-4 text-xs text-slate-500">
      <span>Signed in as {session.user.email}</span>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button type="submit" className="font-medium text-brand-700 hover:underline">
          Sign out
        </button>
      </form>
    </div>
  );
}
