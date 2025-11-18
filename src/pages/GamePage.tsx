import React from "react";
import type { GameDefinition, TicTacToeDifficulty } from "../types/game";
import DifficultyMenu from "../components/DifficultyMenu";
import TicTacToeGame from "../games/TicTacToeGame";

interface GamePageProps {
  game: GameDefinition;
  bestScore: number | null;
  onBack: () => void;
  onRestart: () => void;
  onRandom: () => void;
  onScoreUpdate: (score: number) => void;
  onHighScore: (score: number) => void;
  resetSignal: number;
  difficulty?: TicTacToeDifficulty;
  onDifficultyChange?: (value: TicTacToeDifficulty) => void;
}

const GamePage: React.FC<GamePageProps> = ({
  game,
  bestScore,
  onBack,
  onRestart,
  onRandom,
  onScoreUpdate,
  onHighScore,
  resetSignal,
  difficulty = "normal",
  onDifficultyChange,
}) => {
  const Component = game.component;
  const isTicTacToe = game.id === "tictactoe";
  const bestScoreLabel = bestScore === null ? "\u2014" : bestScore;

  return (
    <section className="app-shell">
      <div className="game-view-layout">
        <div className="game-view-header">
          <div className="heading-content">
            <p className="modal-eyebrow">{game.category}</p>
            <h2 className="game-view-title">{game.name}</h2>
            <p className="modal-description">{game.description}</p>
            <div className="game-view-inline-actions">
              <button type="button" onClick={onBack}>
                Back
              </button>
              <button type="button" onClick={onRestart}>
                Restart
              </button>
              <button type="button" onClick={onRandom}>
                Random Game
              </button>
            </div>
          </div>
          <div className="best-score-badge">
            <span>Best Score</span>
            <strong>{bestScoreLabel}</strong>
          </div>
        </div>
        {isTicTacToe && onDifficultyChange && (
          <DifficultyMenu difficulty={difficulty} onSelect={onDifficultyChange} />
        )}
        <div className="game-view-stage">
          {isTicTacToe ? (
            <TicTacToeGame
              resetSignal={resetSignal}
              onScoreUpdate={onScoreUpdate}
              onHighScore={onHighScore}
              difficulty={difficulty}
            />
          ) : (
            <Component
              resetSignal={resetSignal}
              onScoreUpdate={onScoreUpdate}
              onHighScore={onHighScore}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default GamePage;
