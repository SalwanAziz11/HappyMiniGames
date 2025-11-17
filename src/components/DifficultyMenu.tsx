import React from "react";
import type { TicTacToeDifficulty } from "../types/game";

interface DifficultyMenuProps {
  difficulty: TicTacToeDifficulty;
  onSelect: (value: TicTacToeDifficulty) => void;
}

const DifficultyMenu: React.FC<DifficultyMenuProps> = ({ difficulty, onSelect }) => (
  <div className="difficulty-menu">
    <p className="modal-description difficulty-label">Difficulty</p>
    <div className="difficulty-options">
      {(["easy", "normal", "hard"] as TicTacToeDifficulty[]).map((level) => (
        <button
          key={level}
          type="button"
          className={`difficulty-pill ${difficulty === level ? "active" : ""}`}
          onClick={() => onSelect(level)}
          aria-pressed={difficulty === level}
        >
          {level}
        </button>
      ))}
    </div>
  </div>
);

export default DifficultyMenu;
