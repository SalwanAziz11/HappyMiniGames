import React from "react";
import type { GameDefinition } from "../types/game";
import GameCard from "./GameCard";

interface GameGridProps {
  games: GameDefinition[];
  bestScores: Record<string, number>;
  onSelect: (id: string) => void;
}

const GameGrid: React.FC<GameGridProps> = ({ games, bestScores, onSelect }) => (
  <div className="card-grid" id="game-grid">
    {games.map((game) => (
      <GameCard
        key={game.id}
        game={game}
        bestScore={bestScores[game.id] ?? null}
        onSelect={onSelect}
      />
    ))}
  </div>
);

export default GameGrid;
