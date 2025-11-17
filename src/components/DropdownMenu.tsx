import React from "react";
import ThemeToggle from "./ThemeToggle";

interface DropdownMenuProps {
  open: boolean;
  onThemeToggle: () => void;
  currentTheme: "light" | "dark";
  panelRef: React.RefObject<HTMLDivElement | null>;
  onStats: () => void;
}

const createMenuItems = (onStats: () => void) => [
  { label: "Profile", icon: "👤" },
  { label: "Stats", icon: "📊", action: onStats },
  { label: "High Scores", icon: "🏆" },
  { label: "Login / Logout", icon: "🔐" },
];

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  open,
  onThemeToggle,
  currentTheme,
  panelRef,
  onStats,
}) => {
  const menuItems = createMenuItems(onStats);

  return (
    <div
      ref={panelRef}
      className={`menu-panel ${open ? "open" : ""}`}
      aria-hidden={!open}
    >
      <p className="menu-title">Quick access</p>
      <div className="menu-items">
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            type="button"
            className={`menu-item ${open ? "slide-in" : ""}`}
            style={{ animationDelay: `${open ? index * 60 : 0}ms` }}
            onClick={() => {
              if (item.action) {
                item.action();
              }
            }}
          >
            <span className="menu-item-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <div className="dropdown-separator" />
      <ThemeToggle
        theme={currentTheme}
        onToggle={onThemeToggle}
        animationDelay={open ? menuItems.length * 70 : 0}
        isOpen={open}
      />
    </div>
  );
};

export default DropdownMenu;
