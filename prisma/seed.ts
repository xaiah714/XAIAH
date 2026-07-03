import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Bootstraps the first admin account. There's no self-serve admin signup by
 * design — run this once against a fresh database.
 * Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... npm run db:seed
 */
async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const email = process.env.ADMIN_EMAIL ?? "admin@tutorapp.test";
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    create: { email, name: "Admin", passwordHash, role: "ADMIN" },
    update: {},
  });

  console.log(`Admin ready: ${admin.email} (${admin.id})`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log(`Default password is "changeme123" — change it before deploying.`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
