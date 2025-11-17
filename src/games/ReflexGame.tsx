import { useEffect, useRef, useState } from "react";
import type { GameComponentProps } from "../types/game";

const ReflexGame: React.FC<GameComponentProps> = ({ onScoreUpdate, resetSignal }) => {
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("Tap start to begin!");
  const [timerId, setTimerId] = useState<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef(0);
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  useEffect(() => {
    onScoreUpdate(count);
  }, [count, onScoreUpdate]);

  const reset = () => {
    setCount(0);
    countRef.current = 0;
    setRunning(false);
    setStatus("Tap start to begin!");
    setRemaining(0);
    if (timerId) clearTimeout(timerId);
    setTimerId(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const start = () => {
    if (timerId) clearTimeout(timerId);
    setCount(0);
    countRef.current = 0;
    setRunning(true);
    setStatus("Tap the bubble!");
    setRemaining(9);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    const id = setTimeout(() => {
      setRunning(false);
      setStatus(`Time's up! ${countRef.current} taps.`);
      onScoreUpdate(countRef.current);
      setRemaining(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    }, 9000);
    setTimerId(id);
  };

  const tap = () => {
    if (!running) return;
    setCount((prev) => {
      const next = prev + 1;
      countRef.current = next;
      return next;
    });
  };

  return (
    <div style={{ textAlign: "center" }}>
      <p className="modal-description">{status}</p>
      <p className="modal-description" style={{ marginTop: 0 }}>
        Time left: <strong>{running ? `${remaining}s` : "--"}</strong>
      </p>
      <button
        className="reflex-button"
        type="button"
        onPointerDown={(event) => {
          event.preventDefault();
          tap();
        }}
        onKeyDown={(event) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            tap();
          }
        }}
      >
        Tap!
      </button>
      <div className="game-actions" style={{ justifyContent: "center", marginTop: 18 }}>
        <button type="button" onClick={start} disabled={running}>
          Start
        </button>
        <button type="button" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default ReflexGame;
