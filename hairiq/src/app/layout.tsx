import type { Metadata, Viewport } from "next";
import { Nunito, Quicksand } from "next/font/google";
import "./globals.css";
import { QuizProvider } from "@/lib/quiz-context";
import { APP_NAME, SUBTAGLINE, TAGLINE } from "@/lib/branding";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${APP_NAME} — ${TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description: SUBTAGLINE,
  openGraph: {
    title: `${APP_NAME} — ${TAGLINE}`,
    description: SUBTAGLINE,
    type: "website",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary",
    title: `${APP_NAME} — ${TAGLINE}`,
    description: SUBTAGLINE,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF9F4",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${quicksand.variable} ${nunito.variable} antialiased`}>
      <body className="min-h-dvh">
        <QuizProvider>{children}</QuizProvider>
      </body>
    </html>
  );
}
