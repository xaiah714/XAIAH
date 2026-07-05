import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyTotp } from "@/lib/totp";

/** Password was correct but a TOTP code is needed (or wasn't supplied yet). */
export class TwoFactorRequiredError extends CredentialsSignin {
  code = "twofactor_required";
}

/** Password was correct but the supplied TOTP code didn't check out. */
export class TwoFactorInvalidError extends CredentialsSignin {
  code = "twofactor_invalid";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "2FA code", type: "text" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const code = credentials?.code as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        if (user.twoFactorEnabled) {
          if (!code) throw new TwoFactorRequiredError();
          if (!user.twoFactorSecret || !verifyTotp(user.twoFactorSecret, code)) {
            throw new TwoFactorInvalidError();
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: string }).role;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "STUDENT" | "TUTOR" | "ADMIN";
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
});
