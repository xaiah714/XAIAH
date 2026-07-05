import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 3) return NextResponse.json({ questions: [] });

  const questions = await prisma.question.findMany({
    where: {
      status: { in: ["ANSWERED", "RESOLVED"] },
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { body: { contains: q, mode: "insensitive" } },
        { courseName: { contains: q, mode: "insensitive" } },
        { textbookName: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, title: true, subject: true, status: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json({ questions });
}
