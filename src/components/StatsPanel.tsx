import React from "react";

interface StatsPanelProps {
  open: boolean;
  gamesPlayed: number;
  topGames: { name: string; score: number }[];
  onClose: () => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ open, gamesPlayed, topGames, onClose }) => {
  if (!open) return null;
  return (
    <div className="stats-overlay" role="dialog" aria-modal="true">
      <div className="stats-panel">
        <header className="stats-header">
          <div>
            <p className="modal-eyebrow">Profile stats</p>
            <h3 className="section-title">Play history</h3>
          </div>
          <button type="button" className="close-button" onClick={onClose}>
            ✕
          </button>
        </header>
        <p className="modal-description" style={{ marginBottom: "1rem" }}>
          Games started: <strong>{gamesPlayed}</strong>
        </p>
        <div className="stats-list">
          {topGames.length ? (
            topGames.map((entry) => (
              <div key={entry.name} className="stat-row">
                <span>{entry.name}</span>
                <strong>{entry.score}</strong>
              </div>
            ))
          ) : (
            <p className="modal-description">Play a game to populate your leaderboard.</p>
          )}
        </div>
        <button type="button" className="hero-button wide" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default StatsPanel;
