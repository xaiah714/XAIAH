import { Quicksand, Nunito } from "next/font/google";
import { QuizProvider } from "@/components/QuizProvider";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-quicksand",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
});

export const metadata = {
  title: "HairIQ — your hair's game plan",
  description:
    "A 2-minute quiz that builds your personalized hair care routine — with drugstore, luxury, and cruelty-free picks for every step.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${quicksand.variable} ${nunito.variable}`}>
      <body className="min-h-dvh antialiased">
        <QuizProvider>{children}</QuizProvider>
      </body>
    </html>
  );
}
