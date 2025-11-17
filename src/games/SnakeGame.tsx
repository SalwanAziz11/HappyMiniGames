import { useEffect, useState } from "react";
import type { GameComponentProps } from "../types/game";

const GRID_SIZE = 16;
const INITIAL_SNAKE = [
  { x: 5, y: 5 },
  { x: 4, y: 5 },
  { x: 3, y: 5 },
];

const directions = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
} as const;

type Direction = { x: number; y: number };

const SnakeGame: React.FC<GameComponentProps> = ({ onScoreUpdate, resetSignal }) => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(directions.ArrowRight);
  const [food, setFood] = useState({ x: 10, y: 7 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  useEffect(() => {
    onScoreUpdate(score);
  }, [score, onScoreUpdate]);

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
      }
      const key = event.key as keyof typeof directions;
      const dir = directions[key];
      if (dir && (dir.x !== -direction.x || dir.y !== -direction.y)) {
        setDirection(dir);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [direction]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        const next: { x: number; y: number } = { x: head.x + direction.x, y: head.y + direction.y };
        if (
          next.x < 0 ||
          next.y < 0 ||
          next.x >= GRID_SIZE ||
          next.y >= GRID_SIZE ||
          prev.some((segment) => segment.x === next.x && segment.y === next.y)
        ) {
          setGameOver(true);
          return prev;
        }
        const ateFood = next.x === food.x && next.y === food.y;
        const updated = [next, ...prev];
        if (!ateFood) {
          updated.pop();
        } else {
          spawnFood(updated);
          setScore((prevScore) => prevScore + 10);
        }
        return updated;
      });
    }, 180);
    return () => clearInterval(interval);
  }, [direction, food, gameOver]);

  const spawnFood = (currentSnake: typeof snake) => {
    let next: { x: number; y: number };
    do {
      next = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some((segment) => segment.x === next.x && segment.y === next.y));
    setFood(next);
  };

  const reset = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(directions.ArrowRight);
    setScore(0);
    setGameOver(false);
    spawnFood(INITIAL_SNAKE);
  };

  return (
    <div>
      <p className="modal-description">{gameOver ? "Game over! Press Restart." : "Use arrows to steer the snake."}</p>
      <div className="snake-board">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE;
          const y = Math.floor(index / GRID_SIZE);
          const isBody = snake.some((segment) => segment.x === x && segment.y === y);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;
          return (
            <span
              key={`${x}-${y}`}
              className={`snake-cell ${isBody ? "snake-body" : ""} ${isHead ? "snake-head" : ""} ${
                isFood ? "snake-food" : ""
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SnakeGame;
