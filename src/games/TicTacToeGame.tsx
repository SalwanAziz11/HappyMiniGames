import { useEffect, useState } from "react";
import type { GameComponentProps, TicTacToeDifficulty } from "../types/game";

// Inspired by Google’s modern Tic-Tac-Toe panel: clean grid + smart AI difficulties.

const combos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

interface TicTacToeProps extends GameComponentProps {
  difficulty?: TicTacToeDifficulty;
}

const TicTacToeGame: React.FC<TicTacToeProps> = ({
  onScoreUpdate,
  resetSignal,
  difficulty = "normal",
}) => {
  const [cells, setCells] = useState<string[]>(Array(9).fill(""));
  const [message, setMessage] = useState("Tap a tile to begin");
  const [aiThinking, setAiThinking] = useState(false);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  const reset = () => {
    setCells(Array(9).fill(""));
    setMessage("Tap a tile to begin");
    setAiThinking(false);
  };

  const checkWinner = (grid: string[]) => {
    const winnerCombo = combos.find(
      ([a, b, c]) => grid[a] && grid[a] === grid[b] && grid[a] === grid[c]
    );
    return winnerCombo ? grid[winnerCombo[0]] : null;
  };

  const handlePlayerMove = (index: number) => {
    if (cells[index] || aiThinking) return;
    const next = [...cells];
    next[index] = "X";
    setCells(next);
    const winner = checkWinner(next);
    if (winner) {
      setMessage(`${winner} wins!`);
      onScoreUpdate(winner === "X" ? 1 : -1);
      return;
    }
    if (next.every(Boolean)) {
      setMessage("Draw! Reset to play again.");
      onScoreUpdate(0);
      return;
    }
    setAiThinking(true);
    setMessage("Computer thinking...");
    setTimeout(() => aiMove(next), difficulty === "hard" ? 200 : 400);
  };

  const aiMove = (current: string[]) => {
    const empty = current
      .map((cell, idx) => (cell === "" ? idx : -1))
      .filter((idx) => idx >= 0);
    let move: number | null = null;

    if (difficulty === "easy") {
      move = empty[Math.floor(Math.random() * empty.length)];
    } else if (difficulty === "normal") {
      move =
        findBestMove(current, "O") ??
        findBestMove(current, "X") ??
        empty[Math.floor(Math.random() * empty.length)];
    } else {
      move = minimaxDecision(current, empty);
    }

    if (move === null) {
      setAiThinking(false);
      setMessage("Draw! Reset to play again.");
      onScoreUpdate(0);
      return;
    }
    const updated = [...current];
    updated[move] = "O";
    setCells(updated);
    const winner = checkWinner(updated);
    setAiThinking(false);
    if (winner) {
      setMessage(`${winner} wins!`);
      onScoreUpdate(winner === "X" ? 1 : -1);
      return;
    }
    if (updated.every(Boolean)) {
      setMessage("Draw! Reset to play again.");
      onScoreUpdate(0);
      return;
    }
    setMessage("Your turn");
  };

  const findBestMove = (grid: string[], player: string) => {
    for (const combo of combos) {
      const [a, b, c] = combo;
      const values = [grid[a], grid[b], grid[c]];
      if (values.filter((value) => value === player).length === 2 && values.some((value) => value === "")) {
        return combo[values.indexOf("")];
      }
    }
    return null;
  };

  const minimaxDecision = (grid: string[], available: number[]) => {
    const evaluate = (board: string[]) => {
      const winner = checkWinner(board);
      if (winner === "O") return 10;
      if (winner === "X") return -10;
      return 0;
    };

    const minimax = (board: string[], depth: number, isMax: boolean): number => {
      const score = evaluate(board);
      if (score === 10 || score === -10) return score;
      if (!board.includes("")) return 0;

      if (isMax) {
        let best = -Infinity;
        board.forEach((cell, idx) => {
          if (!cell) {
            board[idx] = "O";
            best = Math.max(best, minimax(board, depth + 1, false));
            board[idx] = "";
          }
        });
        return best;
      }
      let best = Infinity;
      board.forEach((cell, idx) => {
        if (!cell) {
          board[idx] = "X";
          best = Math.min(best, minimax(board, depth + 1, true));
          board[idx] = "";
        }
      });
      return best;
    };

    let bestVal = -Infinity;
    let bestMove: number | null = null;
    available.forEach((cellIndex) => {
      grid[cellIndex] = "O";
      const moveVal = minimax(grid, 0, false);
      grid[cellIndex] = "";
      if (moveVal > bestVal) {
        bestMove = cellIndex;
        bestVal = moveVal;
      }
    });
    if (bestMove !== null) return bestMove;
    return available.length ? available[Math.floor(Math.random() * available.length)] : null;
  };

  return (
    <div>
      <div className="status-bar">{aiThinking ? "Computer thinking..." : message}</div>
      <div className="tic-board">
        {cells.map((value, index) => (
          <button
            key={index}
            className={`tic-cell ${value ? "filled" : ""}`}
            onClick={() => handlePlayerMove(index)}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TicTacToeGame;
