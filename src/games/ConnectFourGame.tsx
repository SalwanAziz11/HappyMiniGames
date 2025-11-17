import { useEffect, useState } from "react";
import type { GameComponentProps } from "../types/game";

type Disc = "R" | "Y" | null;

const ROWS = 6;
const COLS = 7;

const ConnectFourGame: React.FC<GameComponentProps> = ({ onScoreUpdate, resetSignal }) => {
  const [board, setBoard] = useState<Disc[][]>(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
  const [redTurn, setRedTurn] = useState(true);
  const [message, setMessage] = useState("Drop a disc to start!");
  const [redWins, setRedWins] = useState(0);

  useEffect(() => {
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
    setRedTurn(true);
    setMessage("Drop a disc to start!");
    setRedWins(0);
    setTimeout(() => {}, 0);
  }, [resetSignal]);

  useEffect(() => {
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
    setRedTurn(true);
    setMessage("Drop a disc to start!");
    setRedWins(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  if (resetSignal) {
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
    setRedTurn(true);
    setMessage("Drop a disc to start!");
  }

  const dropDisc = (col: number) => {
    const row = board.slice().reverse().findIndex((row) => row[col] === null);
    if (row === -1) return;
    const actualRow = ROWS - 1 - row;
    setBoard((prev) =>
      prev.map((line, r) =>
        r === actualRow ? line.map((cell, c) => (c === col ? (redTurn ? "R" : "Y") : cell)) : line
      )
    );
    checkWinner(actualRow, col, redTurn ? "R" : "Y");
    setRedTurn((prev) => !prev);
    setMessage(`${redTurn ? "Yellow" : "Red"}'s turn`);
  };

  const checkDirection = (startRow: number, startCol: number, dr: number, dc: number, player: Disc) => {
    let count = 0;
    for (let step = -3; step <= 3; step += 1) {
      const row = startRow + dr * step;
      const col = startCol + dc * step;
      if (row >= 0 && row < ROWS && col >= 0 && col < COLS && board[row][col] === player) {
        count += 1;
        if (count >= 4) return true;
      } else {
        count = 0;
      }
    }
    return false;
  };

  const checkWinner = (row: number, col: number, player: Disc) => {
    if (!player) return;
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];
    const won = directions.some(([dr, dc]) => checkDirection(row, col, dr, dc, player));
    if (won) {
    setMessage(`${player === "R" ? "Red" : "Yellow"} wins!`);
    setRedWins((prev) => {
      const updated = prev + 1;
      onScoreUpdate(updated);
      return updated;
    });
    }
  };

  return (
    <div>
      <p className="modal-description">{message}</p>
      <p style={{ textAlign: "center", margin: "0.5rem 0", color: "var(--text-muted)" }}>
        Red wins tracked: {redWins}
      </p>
      <div className="connect-grid">
        {Array.from({ length: 6 }).map((_, row) =>
          Array.from({ length: 7 }).map((_, col) => (
            <button key={`${row}-${col}`} onClick={() => dropDisc(col)}>
              <span className={`connect-cell ${board[row][col] ? (board[row][col] === "R" ? "red" : "yellow") : ""}`} />
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ConnectFourGame;
