import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "STUDENT" | "TUTOR" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    role: "STUDENT" | "TUTOR" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "STUDENT" | "TUTOR" | "ADMIN";
  }
}
