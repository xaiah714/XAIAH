import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { z } from "zod";
import { MatchStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentStudentId } from "@/lib/session";

const statusSchema = z.nativeEnum(MatchStatus);

const ALLOWED_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const studentId = await getCurrentStudentId();
  if (!studentId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const match = await prisma.match.findUnique({ where: { id } });
  if (!match || match.studentId !== studentId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const statusRaw = formData.get("status");
  const parsedStatus = statusSchema.safeParse(statusRaw);
  if (!parsedStatus.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 422 });
  }

  let confirmationUrl: string | undefined;
  const screenshot = formData.get("screenshot");
  if (screenshot instanceof File && screenshot.size > 0) {
    if (screenshot.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 413 });
    }
    const ext = ALLOWED_EXTENSIONS[screenshot.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Unsupported file type. Use PNG, JPG, WEBP, or PDF." },
        { status: 415 },
      );
    }
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const filename = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await screenshot.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buffer);
    confirmationUrl = `/uploads/${filename}`;
  }

  const updated = await prisma.match.update({
    where: { id },
    data: {
      status: parsedStatus.data,
      statusUpdatedAt: new Date(),
      ...(confirmationUrl ? { confirmationUrl } : {}),
    },
  });

  return NextResponse.json({ match: updated });
}
