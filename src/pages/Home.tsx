import React from "react";
import GameGrid from "../components/GameGrid";
import type { GameDefinition } from "../types/game";

interface HomeProps {
  games: GameDefinition[];
  bestScores: Record<string, number>;
  onSelect: (id: string) => void;
  onRandom: () => void;
  onRecent: () => void;
}

const Home: React.FC<HomeProps> = ({ games, bestScores, onSelect, onRandom, onRecent }) => (
  <section className="app-shell">
    <div className="hero">
      <p className="hero-eyebrow">Pastel playroom</p>
      <h1 className="hero-title">Happy Mini Arcade</h1>
      <p className="hero-subtitle">
        A playful Nintendo-inspired hub with dozens of quick challenges. Tap a card or try a
        random experience.
      </p>
      <div className="hero-actions">
        <button className="hero-button" type="button" onClick={onRecent}>
          Recent Games You Played
        </button>
        <button className="hero-button hero-button--random" type="button" onClick={onRandom}>
          Random Game
        </button>
        <button
          className="see-all-button hero-button"
          type="button"
          onClick={() =>
            document
              .getElementById("game-grid")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          See All Games
        </button>
      </div>
    </div>
    <GameGrid games={games} bestScores={bestScores} onSelect={onSelect} />
  </section>
);

export default Home;
