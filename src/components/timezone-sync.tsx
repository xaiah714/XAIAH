"use client";

import { useEffect } from "react";

/** Silently keeps the student's stored timezone in sync with their browser's. */
export default function TimezoneSync() {
  useEffect(() => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!timezone) return;
      fetch("/api/students/timezone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone }),
      }).catch(() => {});
    } catch {
      // Intl unsupported — nothing to sync.
    }
  }, []);

  return null;
}
