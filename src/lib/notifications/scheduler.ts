import { MatchStatus, NotificationType, NotificationChannel } from "@prisma/client";
import { prisma } from "@/lib/db";
import { sendSms, sendEmail } from "@/lib/notifications/send";
import { daysUntil, formatCurrency, formatDate } from "@/lib/format";

// Deadline reminder thresholds, checked in this order. Assumes the sweep
// runs roughly daily; if it runs less often a student could see more than
// one threshold fire in the same run (acceptable for v1 scaffolding, but
// worth tightening before relying on this in production).
const DEADLINE_THRESHOLDS: { type: Extract<NotificationType, "DEADLINE_30" | "DEADLINE_14" | "DEADLINE_3">; days: number }[] = [
  { type: "DEADLINE_30", days: 30 },
  { type: "DEADLINE_14", days: 14 },
  { type: "DEADLINE_3", days: 3 },
];

const RENEWAL_WINDOW_DAYS = 60;
const ACTIVE_APPLICATION_STATUSES: MatchStatus[] = ["NOT_STARTED", "IN_PROGRESS"];

function pickChannel(phone: string | null): NotificationChannel {
  return phone ? "SMS" : "EMAIL";
}

async function alreadySent(matchId: string, type: NotificationType) {
  const existing = await prisma.notification.findFirst({ where: { matchId, type } });
  return existing != null;
}

async function dispatch(params: {
  studentId: string;
  matchId: string;
  type: NotificationType;
  phone: string | null;
  email: string;
  smsBody: string;
  emailSubject: string;
  emailHtml: string;
}) {
  const channel = pickChannel(params.phone);
  const ok =
    channel === "SMS"
      ? await sendSms(params.phone as string, params.smsBody)
      : await sendEmail(params.email, params.emailSubject, params.emailHtml);

  await prisma.notification.create({
    data: {
      studentId: params.studentId,
      matchId: params.matchId,
      type: params.type,
      channel,
      sentAt: ok ? new Date() : null,
    },
  });

  return ok;
}

/**
 * One pass over all in-flight matches: fires deadline reminders, the
 * day-after "did you submit?" nudge, and renewal reminders for awarded
 * renewable scholarships. Designed to be called by an external scheduler
 * (see /api/cron/notifications) roughly once a day.
 */
export async function runNotificationSweep() {
  const matches = await prisma.match.findMany({
    include: { student: true, scholarship: true },
  });

  const summary = { deadline: 0, statusCheck: 0, renewal: 0 };

  for (const match of matches) {
    const { student, scholarship } = match;
    const daysLeft = daysUntil(scholarship.deadline);

    if (ACTIVE_APPLICATION_STATUSES.includes(match.status)) {
      for (const threshold of DEADLINE_THRESHOLDS) {
        if (daysLeft < 0 || daysLeft > threshold.days) continue;
        if (await alreadySent(match.id, threshold.type)) continue;

        await dispatch({
          studentId: student.id,
          matchId: match.id,
          type: threshold.type,
          phone: student.phone,
          email: student.email,
          smsBody: `${threshold.days} days left to apply for ${scholarship.name} (${formatCurrency(
            scholarship.amountMax,
          )}) — due ${formatDate(scholarship.deadline)}.`,
          emailSubject: `${threshold.days} days left: ${scholarship.name}`,
          emailHtml: `<p>Your match <strong>${scholarship.name}</strong> (${formatCurrency(
            scholarship.amountMin,
          )}–${formatCurrency(scholarship.amountMax)}) is due <strong>${formatDate(
            scholarship.deadline,
          )}</strong>.</p><p>${scholarship.essayRequired ? `Essay required (~${scholarship.essayWordCount ?? "?"} words). ` : "No essay required. "}Apply here: <a href="${scholarship.sourceUrl}">${scholarship.sourceUrl}</a></p>`,
        });
        summary.deadline += 1;
      }

      if (daysLeft <= -1 && !(await alreadySent(match.id, "STATUS_CHECK"))) {
        await dispatch({
          studentId: student.id,
          matchId: match.id,
          type: "STATUS_CHECK",
          phone: student.phone,
          email: student.email,
          smsBody: `Did you submit your application for ${scholarship.name}? Update your status on ScholarMatch.`,
          emailSubject: `Did you submit your ${scholarship.name} application?`,
          emailHtml: `<p>The deadline for <strong>${scholarship.name}</strong> passed on ${formatDate(
            scholarship.deadline,
          )}. Log into ScholarMatch to update its status.</p>`,
        });
        summary.statusCheck += 1;
      }
    }

    if (scholarship.renewable && match.status === "AWARDED") {
      const renewalDate = new Date(scholarship.deadline);
      renewalDate.setUTCFullYear(renewalDate.getUTCFullYear() + 1);
      const daysToRenewal = daysUntil(renewalDate);

      if (
        daysToRenewal >= 0 &&
        daysToRenewal <= RENEWAL_WINDOW_DAYS &&
        !(await alreadySent(match.id, "RENEWAL"))
      ) {
        await dispatch({
          studentId: student.id,
          matchId: match.id,
          type: "RENEWAL",
          phone: student.phone,
          email: student.email,
          smsBody: `Renew your ${scholarship.name} award — renewal window closes ${formatDate(renewalDate)}.`,
          emailSubject: `Renew your ${scholarship.name} scholarship`,
          emailHtml: `<p>Your <strong>${scholarship.name}</strong> award is renewable. The next renewal deadline is <strong>${formatDate(
            renewalDate,
          )}</strong> — check the official listing for renewal requirements: <a href="${scholarship.sourceUrl}">${scholarship.sourceUrl}</a></p>`,
        });
        summary.renewal += 1;
      }
    }
  }

  return summary;
}
