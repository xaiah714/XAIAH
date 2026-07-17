import { Quicksand, Nunito, Pacifico } from "next/font/google";
import Script from "next/script";
import { QuizProvider } from "@/components/QuizProvider";
import LanguageToggle from "@/components/LanguageToggle";
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

// Chunky cursive display face for the wordmark only (owner request) — body
// and headings stay on Quicksand for readability.
const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pacifico",
});

export const metadata = {
  title: "How Is My Hair — your hair's game plan",
  description:
    "A 2-minute quiz that builds your personalized hair care routine — with affordable, luxury, and cruelty-free picks for every step.",
  openGraph: {
    title: "How Is My Hair — your hair's game plan",
    description:
      "A 2-minute quiz that builds your personalized hair care routine — with affordable, luxury, and cruelty-free picks for every step.",
    siteName: "How Is My Hair",
    type: "website",
  },
};

// Explicit viewport (Next.js emits this by default; pinned here so the
// responsive contract is visible in code, not implied).
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${quicksand.variable} ${nunito.variable} ${pacifico.variable}`}>
      <body className="min-h-dvh antialiased">
        <QuizProvider>{children}</QuizProvider>
        <LanguageToggle />
        {/* Google Website Translator (Español toggle). The init script also
            patches removeChild/insertBefore — the standard fix for React
            crashes when translation wraps text nodes in <font> tags. */}
        <div id="google_translate_element" className="hidden" aria-hidden="true" />
        <Script id="gt-init" strategy="afterInteractive">{`
          if (typeof Node !== "undefined" && !window.__gtDomPatched) {
            window.__gtDomPatched = true;
            var rc = Node.prototype.removeChild;
            Node.prototype.removeChild = function (child) {
              if (child && child.parentNode !== this) return child;
              return rc.apply(this, arguments);
            };
            var ib = Node.prototype.insertBefore;
            Node.prototype.insertBefore = function (newNode, ref) {
              if (ref && ref.parentNode !== this) return newNode;
              return ib.apply(this, arguments);
            };
          }
          window.googleTranslateElementInit = function () {
            try {
              new window.google.translate.TranslateElement(
                { pageLanguage: "en", includedLanguages: "en,es", autoDisplay: false },
                "google_translate_element"
              );
            } catch (e) {}
          };
        `}</Script>
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
