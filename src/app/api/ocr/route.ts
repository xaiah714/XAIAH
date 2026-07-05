import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractTextFromImage } from "@/lib/ocr";

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Photo-to-search: extract text from an uploaded problem photo and check
 * whether it's already answered in the bank. Returns {text, questions}.
 * With OCR stubbed (see src/lib/ocr.ts) this returns empty results and the
 * ask flow proceeds normally.
 */
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ text: null, questions: [] });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const text = await extractTextFromImage(buffer);
  if (!text || text.trim().length < 8) {
    return NextResponse.json({ text: null, questions: [] });
  }

  // Use the longest words as the search signal — full OCR text is noisy.
  const terms = [...new Set(text.trim().split(/\s+/).filter((w) => w.length >= 4))]
    .sort((a, b) => b.length - a.length)
    .slice(0, 6);
  if (terms.length === 0) return NextResponse.json({ text, questions: [] });

  const questions = await prisma.question.findMany({
    where: {
      status: { in: ["ANSWERED", "RESOLVED"] },
      OR: terms.flatMap((t) => [
        { title: { contains: t, mode: "insensitive" as const } },
        { body: { contains: t, mode: "insensitive" as const } },
      ]),
    },
    select: { id: true, title: true, subject: true, status: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json({ text, questions });
}
