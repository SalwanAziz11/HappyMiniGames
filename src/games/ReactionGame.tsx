import { useEffect, useState } from "react";
import type { GameComponentProps } from "../types/game";

const ReactionGame: React.FC<GameComponentProps> = ({ onScoreUpdate, resetSignal }) => {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState("Wait for green, then tap!");

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  const reset = () => {
    setActive(false);
    setStatus("Wait for green, then tap!");
    setTimeout(() => setActive(true), 1000);
  };

  const handleClick = () => {
    if (!active) {
      setStatus("Too soon! Try again.");
      setTimeout(reset, 1000);
      return;
    }
    const reaction = Math.max(0, Math.floor(Math.random() * 100));
    onScoreUpdate(reaction);
    setStatus(`Reaction: ${reaction}ms`);
    setActive(false);
    setTimeout(reset, 1100);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <p className="modal-description">{status}</p>
      <button
        className="reflex-button"
        onClick={handleClick}
        style={{ background: active ? "var(--accent)" : "rgba(248,113,113,0.7)" }}
      >
        {active ? "Tap!" : "Wait..."}
      </button>
    </div>
  );
};

export default ReactionGame;
