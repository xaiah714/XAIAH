import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function assertParticipant(chatSessionId: string, userId: string) {
  const session = await prisma.chatSession.findUnique({ where: { id: chatSessionId } });
  if (!session) return null;
  if (session.studentId !== userId && session.tutorId !== userId) return null;
  return session;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authSession = await auth();
  if (!authSession?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const chatSession = await assertParticipant(id, authSession.user.id);
  if (!chatSession) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const since = new URL(request.url).searchParams.get("since");

  const messages = await prisma.message.findMany({
    where: {
      chatSessionId: id,
      ...(since ? { createdAt: { gt: new Date(since) } } : {}),
    },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true, role: true } } },
  });

  return NextResponse.json({ messages, status: chatSession.status });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authSession = await auth();
  if (!authSession?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const chatSession = await assertParticipant(id, authSession.user.id);
  if (!chatSession) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (chatSession.status !== "ACTIVE") {
    return NextResponse.json({ error: "Session is not active" }, { status: 400 });
  }

  const body = await request.json();
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!text || text.length > 4000) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: { chatSessionId: id, senderId: authSession.user.id, body: text },
    include: { sender: { select: { id: true, name: true, role: true } } },
  });

  return NextResponse.json({ message });
}
