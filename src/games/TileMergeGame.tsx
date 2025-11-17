import { useEffect, useState } from "react";
import type { GameComponentProps } from "../types/game";

const SIZE = 4;

const createBoard = (): number[][] => Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

const addTile = (board: number[][]) => {
  const empty = [];
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if (!board[r][c]) empty.push([r, c]);
    }
  }
  if (!empty.length) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const newBoard = board.map((row) => [...row]);
  newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
};

const TileMergeGame: React.FC<GameComponentProps> = ({ onScoreUpdate, resetSignal }) => {
  const [board, setBoard] = useState(() => addTile(addTile(createBoard())));
  const [score, setScore] = useState(0);

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        move(event.key);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [board]);

  useEffect(() => {
    onScoreUpdate(score);
  }, [score, onScoreUpdate]);

  useEffect(() => {
    setBoard(addTile(addTile(createBoard())));
    setScore(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  const move = (direction: string) => {
    const rotated = rotateBoard([...board.map((row) => [...row])], direction);
    const { newBoard, gained } = compressBoard(rotated);
    const restored = restoreBoard(newBoard, direction);
    if (JSON.stringify(restored) !== JSON.stringify(board)) {
      setBoard(addTile(restored));
      setScore((prev) => prev + gained);
    }
  };

  const rotateBoard = (matrix: number[][], direction: string) => {
    if (direction === "ArrowUp") return transpose(matrix);
    if (direction === "ArrowDown") return rotate180(matrix);
    if (direction === "ArrowRight") return reflect(matrix);
    return matrix;
  };

  const restoreBoard = (matrix: number[][], direction: string) => {
    if (direction === "ArrowUp") return transpose(matrix);
    if (direction === "ArrowDown") return rotate180(matrix);
    if (direction === "ArrowRight") return reflect(matrix);
    return matrix;
  };

  const transpose = (matrix: number[][]) =>
    matrix[0].map((_, c) => matrix.map((row) => row[c]));

  const rotate180 = (matrix: number[][]) =>
    matrix.map((row) => [...row].reverse()).reverse();

  const reflect = (matrix: number[][]) => matrix.map((row) => [...row].reverse());

  const compressBoard = (matrix: number[][]) => {
    let gained = 0;
    const newBoard = matrix.map((row) => {
      const filtered = row.filter((value) => value !== 0);
      for (let i = 0; i < filtered.length - 1; i += 1) {
        if (filtered[i] === filtered[i + 1]) {
          filtered[i] *= 2;
          gained += filtered[i];
          filtered[i + 1] = 0;
        }
      }
      const returned = filtered.filter((value) => value !== 0);
      while (returned.length < SIZE) returned.push(0);
      return returned;
    });
    return { newBoard, gained };
  };

  return (
    <div>
      <p className="modal-description">Use arrow keys to slide tiles and build high numbers.</p>
      <div className="tile-grid">
        {board.map((row, r) =>
          row.map((value, c) => (
            <span key={`${r}-${c}`} className={`tile-cell value-${value}`}>
              {value || ""}
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default TileMergeGame;
