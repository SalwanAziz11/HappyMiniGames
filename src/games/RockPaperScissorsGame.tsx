import { useEffect, useState } from "react";
import type { GameComponentProps } from "../types/game";

// Inspired by modern “versus” layouts with clear player/computer cards and central results.

const options = [
  { label: "✊", name: "Rock", beats: "Scissors" },
  { label: "✋", name: "Paper", beats: "Rock" },
  { label: "✌️", name: "Scissors", beats: "Paper" },
];

// Inspired by modern “versus” layouts — clear player vs CPU cards with a central result panel.
const RockPaperScissorsGame: React.FC<GameComponentProps> = ({ onScoreUpdate, resetSignal }) => {
  const [streak, setStreak] = useState(0);
  const [status, setStatus] = useState("Beat the CPU with a streak!");
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const [cpuChoice, setCpuChoice] = useState<string | null>(null);
  const [result, setResult] = useState("Make a move");

  useEffect(() => {
    setStreak(0);
    setStatus("Beat the CPU with a streak!");
    setPlayerChoice(null);
    setCpuChoice(null);
    setResult("Make a move");
  }, [resetSignal]);

  useEffect(() => {
    onScoreUpdate(streak);
  }, [streak, onScoreUpdate]);

  const play = (choice: typeof options[0]) => {
    const cpu = options[Math.floor(Math.random() * options.length)];
    setPlayerChoice(choice.label);
    setCpuChoice(cpu.label);
    if (choice.name === cpu.name) {
      setResult("Draw");
      setStatus(`Tie! CPU picked ${cpu.name}.`);
      return;
    }
    const win = cpu.name === choice.beats;
    if (win) {
      const next = streak + 1;
      setStreak(next);
      setResult("You win!");
      setStatus(`Nice! CPU chose ${cpu.name}. Streak ${next}.`);
      return;
    }
    setStreak(0);
    setResult("CPU wins");
    setStatus(`CPU chose ${cpu.name}. Streak reset.`);
  };

  const playAgain = () => {
    setPlayerChoice(null);
    setCpuChoice(null);
    setResult("Make a move");
    setStatus("Beat the CPU with a streak!");
  };

  return (
    <div>
      <div className="rps-area">
        <div className="rps-column">
          <h4>You</h4>
          <div className="rps-buttons">
            {options.map((option) => (
              <button key={option.name} className="rps-card" onClick={() => play(option)}>
                {option.label}
              </button>
            ))}
          </div>
          <p className="modal-description" style={{ textAlign: "center" }}>
            {playerChoice ? `You chose ${playerChoice}` : "Choose a move"}
          </p>
        </div>
        <div className="rps-column" style={{ justifyContent: "center" }}>
          <div className="result-display">{result}</div>
          <button className="hero-button" style={{ marginTop: 8 }} onClick={playAgain}>
            Play again
          </button>
        </div>
        <div className="rps-column">
          <h4>CPU</h4>
          <div className="rps-buttons" style={{ justifyContent: "center" }}>
            <div className="rps-card" style={{ opacity: 0.3 }}>
              {cpuChoice ?? "?"}
            </div>
          </div>
          <p className="modal-description" style={{ textAlign: "center" }}>
            {cpuChoice ? "CPU made a move" : "Waiting..."}
          </p>
        </div>
      </div>
      <p className="modal-description" style={{ textAlign: "center", marginTop: 12 }}>
        {status}
      </p>
    </div>
  );
};

export default RockPaperScissorsGame;
