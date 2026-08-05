"use client";

import { useEffect, useState } from "react";

// Español toggle (rev 6 owner request): flips the whole page to Spanish via
// Google Website Translator — machine translation, so a native-Spanish
// content pass is a future quality upgrade, but this makes every screen
// readable in Spanish today. Works by setting the `googtrans` cookie the
// widget reads, then reloading. If Google's script can't load, the page
// simply stays in English — the button never breaks anything.
const COOKIE = "googtrans";

function currentLang() {
  return document.cookie.includes(`${COOKIE}=/en/es`) ? "es" : "en";
}

export default function LanguageToggle() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    setLang(currentLang());
  }, []);

  function toggle() {
    const next = lang === "es" ? "en" : "es";
    const value = next === "es" ? "/en/es" : "/en/en";
    document.cookie = `${COOKIE}=${value}; path=/`;
    try {
      document.cookie = `${COOKIE}=${value}; path=/; domain=${location.hostname}`;
      document.cookie = `${COOKIE}=${value}; path=/; domain=.${location.hostname}`;
    } catch {
      // cookie domain restrictions — path cookie above is enough
    }
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={lang === "es" ? "Switch to English" : "Traducir al español"}
      className="absolute right-3 top-3 z-50 flex min-h-11 items-center gap-1.5 rounded-full border-2 border-blush-deep/60 bg-white/95 px-4 py-2 font-display text-sm font-bold text-cocoa shadow-card backdrop-blur transition hover:border-coral-deep active:scale-95"
    >
      <span aria-hidden="true">🌐</span>
      {lang === "es" ? "English" : "Español"}
    </button>
  );
}
