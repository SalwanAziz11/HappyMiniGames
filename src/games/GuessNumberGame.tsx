import { useEffect, useState } from "react";
import type { GameComponentProps } from "../types/game";

const GuessNumberGame: React.FC<GameComponentProps> = ({ onScoreUpdate, resetSignal }) => {
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 20) + 1);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("Guess a number between 1 and 20.");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  useEffect(() => {
    onScoreUpdate(Math.max(0, 10 - attempts));
  }, [attempts, onScoreUpdate]);

  const reset = () => {
    setTarget(Math.floor(Math.random() * 20) + 1);
    setGuess("");
    setMessage("Guess a number between 1 and 20.");
    setAttempts(0);
  };

  const submit = () => {
    const value = Number(guess);
    if (!value) return;
    setAttempts((prev) => prev + 1);
    if (value === target) {
      setMessage(`Correct! It was ${target}.`);
      return;
    }
    setMessage(value < target ? "Too low!" : "Too high!");
  };

  return (
    <div style={{ textAlign: "center" }}>
      <p className="modal-description">{message}</p>
      <input
        type="number"
        value={guess}
        onChange={(event) => setGuess(event.target.value)}
        style={{ padding: "0.7rem", borderRadius: "12px", border: "1px solid rgba(15,23,42,0.2)", width: 120 }}
      />
      <div className="game-actions" style={{ justifyContent: "center", marginTop: 12 }}>
        <button onClick={submit}>Guess</button>
        <button onClick={reset}>Reset</button>
      </div>
    </div>
  );
};

export default GuessNumberGame;
