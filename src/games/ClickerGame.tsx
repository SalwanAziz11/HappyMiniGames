import { useEffect, useState } from "react";
import type { GameComponentProps } from "../types/game";

const ClickerGame: React.FC<GameComponentProps> = ({ onScoreUpdate, resetSignal }) => {
  const [taps, setTaps] = useState(0);

  useEffect(() => {
    setTaps(0);
  }, [resetSignal]);

  useEffect(() => {
    onScoreUpdate(taps);
  }, [taps, onScoreUpdate]);

  return (
    <div style={{ textAlign: "center" }}>
      <p className="modal-description">Tap the bouncing bubble to rack up points.</p>
      <button className="reflex-button" onClick={() => setTaps((prev) => prev + 1)}>
        {taps}
      </button>
    </div>
  );
};

export default ClickerGame;
