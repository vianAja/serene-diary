"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const transitionTimeout = useRef<number | null>(null);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  function toggleTheme() {
    const nextDark = !dark;
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reduceMotion) {
      root.classList.add("theme-transition");
    }

    root.dataset.theme = nextDark ? "dark" : "light";
    window.localStorage.setItem("serene-diary-theme", nextDark ? "dark" : "light");
    setDark(nextDark);

    if (transitionTimeout.current !== null) {
      window.clearTimeout(transitionTimeout.current);
    }

    if (reduceMotion) {
      root.classList.remove("theme-transition");
      return;
    }

    transitionTimeout.current = window.setTimeout(() => {
      root.classList.remove("theme-transition");
      transitionTimeout.current = null;
    }, 500);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      aria-pressed={dark}
      title={dark ? "Mode terang" : "Mode gelap"}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-outline bg-surface text-primary hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span className={`transition-transform duration-300 motion-reduce:transition-none ${dark ? "rotate-180" : "rotate-0"}`}>
        {dark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
      </span>
    </button>
  );
}
