import React from "react";
import type { CSSProperties } from "react";
import type { GameDefinition } from "../types/game";

interface GameCardProps {
  game: GameDefinition;
  bestScore: number | null;
  onSelect: (id: string) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, bestScore, onSelect }) => {
  const [coords, setCoords] = React.useState({ x: 50, y: 50 });

  const handleMove = (event: React.MouseEvent<HTMLElement>) => {
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - left) / width) * 100;
    const y = ((event.clientY - top) / height) * 100;
    setCoords({ x, y });
  };

  const resetCoords = () => setCoords({ x: 50, y: 50 });

  const handleSelect = () => onSelect(game.id);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect();
    }
  };

  const scoreLabel = bestScore ?? "—";

  return (
    <article
      className="game-card"
      role="button"
      tabIndex={0}
      onMouseMove={handleMove}
      onMouseLeave={resetCoords}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      aria-label={`Play ${game.name}`}
      style={
        {
          "--mx": `${coords.x}%`,
          "--my": `${coords.y}%`,
        } as CSSProperties
      }
    >
      <span className="card-icon">{game.icon}</span>
      <h3 className="card-title">{game.name}</h3>
      <p className="card-description">{game.description}</p>
      <div className="card-footer">
        <span className="category-pill">{game.category}</span>
        <span className="score-label">Best: {scoreLabel}</span>
      </div>
    </article>
  );
};

export default GameCard;
