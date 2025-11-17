import React from "react";

interface RecentGamesPanelProps {
  open: boolean;
  recentGames: string[];
  onClose: () => void;
}

const RecentGamesPanel: React.FC<RecentGamesPanelProps> = ({ open, recentGames, onClose }) => {
  if (!open) return null;

  return (
    <div className="stats-overlay" role="dialog" aria-modal="true">
      <div className="stats-panel">
        <header className="stats-header">
          <div>
            <p className="modal-eyebrow">Recent plays</p>
            <h3 className="section-title">Games you played lately</h3>
          </div>
          <button type="button" className="close-button" onClick={onClose}>
            ✕
          </button>
        </header>
        {recentGames.length ? (
          <div className="stats-list">
            {recentGames.map((name) => (
              <div key={name} className="stat-row">
                <span>{name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="modal-description">Play some games to see them here.</p>
        )}
        <button type="button" className="hero-button wide" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default RecentGamesPanel;
