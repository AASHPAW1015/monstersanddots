/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

// Canvas drawing colours per theme. The DOM uses CSS variables (see App.css);
// the <canvas> can't read those, so it pulls from this matching palette instead.
// Neutral zinc greys + an emerald accent — no blue, no purple.
const PALETTES = {
  dark: {
    canvasBg: "#18181b",
    obstacle: "#3f3f46",
    target: "#ef4444",
    creature: "#d4d4d8",
    elite: "#f59e0b",
    reached: "#10b981",
    dead: "#52525b",
    start: "#10b981",
    path: "#a1a1aa",
    pathNode: "#d4d4d8",
    ray: "rgba(212,212,216,0.16)",
    frontier: "#f59e0b",
    trail: "#10b981",
    traveller: "#34d399",
  },
  light: {
    canvasBg: "#f4f4f5",
    obstacle: "#a1a1aa",
    target: "#dc2626",
    creature: "#3f3f46",
    elite: "#d97706",
    reached: "#059669",
    dead: "#d4d4d8",
    start: "#059669",
    path: "#71717a",
    pathNode: "#3f3f46",
    ray: "rgba(82,82,91,0.16)",
    frontier: "#d97706",
    trail: "#059669",
    traveller: "#10b981",
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  // Reflect the choice onto <html data-theme> so the CSS variables switch,
  // and remember it for next visit.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, palette: PALETTES[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
