import { useEffect, useRef, useState } from "react";
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
  const [isMobile, setIsMobile] = useState(false);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  useEffect(() => {
    onScoreUpdate(score);
  }, [score, onScoreUpdate]);

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));
  }, []);

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
    if (!isMobile || !boardRef.current) return;

    const handleTouchStart = (event: TouchEvent) => {
      const { clientX, clientY } = event.touches[0];
      touchStart.current = { x: clientX, y: clientY };
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (!touchStart.current) return;
      const { clientX, clientY } = event.changedTouches[0];
      const deltaX = clientX - touchStart.current.x;
      const deltaY = clientY - touchStart.current.y;
      touchStart.current = null;
      if (Math.abs(deltaX) < 25 && Math.abs(deltaY) < 25) return;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setDirection((prev) => {
          const next = deltaX > 0 ? directions.ArrowRight : directions.ArrowLeft;
          return next.x === -prev.x ? prev : next;
        });
      } else {
        setDirection((prev) => {
          const next = deltaY > 0 ? directions.ArrowDown : directions.ArrowUp;
          return next.y === -prev.y ? prev : next;
        });
      }
    };

    const board = boardRef.current;
    board.addEventListener("touchstart", handleTouchStart, { passive: true });
    board.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      board.removeEventListener("touchstart", handleTouchStart);
      board.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile]);

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
      <p className="modal-description">
        {gameOver
          ? "Game over! Press Restart."
          : isMobile
            ? "Swipe to steer the snake (optimized for iPhone)."
            : "Use arrow keys to steer the snake."}
      </p>
      <div ref={boardRef} className="snake-board" aria-label="Snake game board">
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
