"use client";

import * as React from "react";

export type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setThemeState] = React.useState<Theme>("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setThemeState(isDark ? "dark" : "light");

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: Theme }>;
      if (customEvent.detail?.theme) {
        setThemeState(customEvent.detail.theme);
      } else {
        const dark = document.documentElement.classList.contains("dark");
        setThemeState(dark ? "dark" : "light");
      }
    };

    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    window.dispatchEvent(new CustomEvent("theme-change", { detail: { theme: newTheme } }));
  }, []);

  const toggleTheme = React.useCallback(() => {
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    const nextTheme: Theme = isCurrentlyDark ? "light" : "dark";
    setTheme(nextTheme);
  }, [setTheme]);

  return {
    theme,
    isDark: theme === "dark",
    setTheme,
    toggleTheme,
    mounted,
  };
}
