import React from "react";

interface HeaderProps {
  onMenuToggle: () => void;
  menuOpen: boolean;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, menuOpen, buttonRef, onLogoClick }) => (
  <header className="nav-bar">
    <button type="button" className="logo-badge" onClick={onLogoClick}>
      <span className="logo-icon" aria-hidden="true">
        🎮
      </span>
      <div className="logo-text">
        <p>Happy Mini</p>
        <strong>Arcade</strong>
      </div>
    </button>
    <button
      ref={buttonRef}
      type="button"
      className={`menu-toggle ${menuOpen ? "open" : ""}`}
      aria-expanded={menuOpen}
      aria-label="Toggle menu"
      onClick={onMenuToggle}
    >
      <span className="menu-icon">
        <span />
        <span />
        <span />
      </span>
      <span className="menu-label">Menu</span>
    </button>
  </header>
);

export default Header;
