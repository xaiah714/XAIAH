import { prisma } from "@/lib/prisma";
import { manuallyVerifyUserAction, resendVerificationAction } from "@/actions/admin";

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Owner escape hatch while no email provider is wired: every unverified
 * account is listed with (a) one-click manual verify, (b) one-click resend,
 * and (c) the user's actual pending verification link, copyable — so the
 * owner can verify testers or text them their link straight from a phone.
 */
export async function UnverifiedUsers() {
  const users = await prisma.user.findMany({
    where: { emailVerified: null, role: { not: "ADMIN" } },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      verificationTokens: {
        where: { purpose: "EMAIL_VERIFY", expiresAt: { gt: new Date() } },
        select: { token: true },
        take: 1,
      },
    },
  });

  if (users.length === 0) return null;

  return (
    <div className="card mt-6">
      <h2 className="font-semibold">
        Unverified accounts ({users.length}) — manual verification
      </h2>
      <p className="mt-1 text-xs text-brand-muted">
        Until a real email key is set, verification emails only print to server logs. Verify
        testers here directly, or copy their link and send it to them yourself.
      </p>
      <ul className="mt-3 flex flex-col gap-3">
        {users.map((u) => {
          const token = u.verificationTokens[0]?.token;
          return (
            <li key={u.id} className="rounded-xl border border-brand-border p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  <span className="font-medium">{u.name}</span>{" "}
                  <span className="text-brand-muted">
                    · {u.email} · {u.role.toLowerCase()} · joined{" "}
                    {u.createdAt.toLocaleDateString()}
                  </span>
                </span>
                <span className="flex gap-2">
                  <form action={manuallyVerifyUserAction.bind(null, u.id)}>
                    <button type="submit" className="btn-primary !px-3 !py-1.5 !text-xs">
                      Verify now
                    </button>
                  </form>
                  <form action={resendVerificationAction.bind(null, u.id)}>
                    <button type="submit" className="btn-secondary !px-3 !py-1.5 !text-xs">
                      Resend email
                    </button>
                  </form>
                </span>
              </div>
              {token ? (
                <input
                  readOnly
                  value={`${appUrl()}/verify-email/${token}`}
                  className="input mt-2 !py-1.5 !text-xs"
                  aria-label={`Verification link for ${u.email}`}
                />
              ) : (
                <p className="mt-2 text-xs text-brand-muted">
                  No active link (expired) — hit &ldquo;Resend email&rdquo; to generate a
                  fresh one.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
