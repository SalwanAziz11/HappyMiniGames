import React from "react";

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggle: () => void;
  animationDelay?: number;
  isOpen?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggle,
  animationDelay = 0,
  isOpen = false,
}) => (
  <button
    type="button"
    className={`menu-item theme-toggle ${isOpen ? "slide-in" : ""}`}
    style={{ animationDelay: `${animationDelay}ms` }}
    onClick={onToggle}
  >
    <span className="theme-icon" aria-hidden="true">
      {theme === "light" ? "🌙" : "☀️"}
    </span>
    <span className="theme-label">
      Switch to {theme === "light" ? "Dark" : "Light"} Mode
    </span>
  </button>
);

export default ThemeToggle;
