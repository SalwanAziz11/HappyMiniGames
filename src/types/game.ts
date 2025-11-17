import type { ComponentType } from "react";

export interface GameComponentProps {
  onScoreUpdate: (score: number) => void;
  resetSignal: number;
  onHighScore?: (score: number) => void;
}

export type TicTacToeDifficulty = "easy" | "normal" | "hard";

export interface GameDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  component: ComponentType<GameComponentProps>;
}

// Add new games by creating a React component that accepts GameComponentProps and
// adding its GameDefinition to src/data/games.ts below.
