import { prisma } from "@/lib/prisma";
import type { Subject } from "@/generated/prisma/client";

/**
 * Finds the best available tutor for a subject: must be ACTIVE, currently
 * marked available, and cover the subject. Picks whoever has the fewest
 * concurrently active chats (load balancing), tie-broken by rating.
 * Encodes "timezone arbitrage": a tutor only shows as available when they've
 * toggled themselves on, which in practice means they're awake right now.
 */
export async function findAvailableTutor(subject: Subject) {
  const candidates = await prisma.user.findMany({
    where: {
      role: "TUTOR",
      tutorStatus: "ACTIVE",
      tutorAvailable: true,
      tutorSubjects: { has: subject },
    },
    include: {
      _count: {
        select: { chatSessionsAsTutor: { where: { status: "ACTIVE" } } },
      },
    },
  });

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const loadDiff = a._count.chatSessionsAsTutor - b._count.chatSessionsAsTutor;
    if (loadDiff !== 0) return loadDiff;
    return b.ratingAverage - a.ratingAverage;
  });

  return candidates[0];
}
