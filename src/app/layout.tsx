import type { Metadata } from "next";
import "./globals.css";
import TimezoneSync from "@/components/timezone-sync";

export const metadata: Metadata = {
  title: "ScholarMatch — Find and finish scholarship applications",
  description:
    "Discover scholarships you actually qualify for, and track every application through to submission.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <TimezoneSync />
        {children}
      </body>
    </html>
  );
}
