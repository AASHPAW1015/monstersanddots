import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const LINKS = [
  { to: "/", label: "Simulation" },
  { to: "/path", label: "Path Learning" },
  { to: "/history", label: "History" },
];

// Shared header: brand + route nav + light/dark toggle. Used by every page.
export function TopBar({ title }) {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        <h1>{title}</h1>
      </div>
      <nav>
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className={pathname === l.to ? "active" : ""}>
            {l.label}
          </Link>
        ))}
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle colour theme">
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </nav>
    </header>
  );
}
