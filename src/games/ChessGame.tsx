import { useEffect, useRef, useState } from "react";
import type { GameComponentProps } from "../types/game";
import { ChessGame as Engine } from "./chessLogic";
import type { Color, Move, Piece, PieceType, Square } from "./chessLogic";

const pieceSymbols: Record<Color, Record<PieceType, string>> = {
  white: {
    pawn: "♙",
    knight: "♘",
    bishop: "♗",
    rook: "♖",
    queen: "♕",
    king: "♔",
  },
  black: {
    pawn: "♟",
    knight: "♞",
    bishop: "♝",
    rook: "♜",
    queen: "♛",
    king: "♚",
  },
};

const colorName: Record<Color, string> = {
  white: "White",
  black: "Black",
};

const pieceValues: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 100,
};

type Position = { row: number; col: number };

const buildKey = (row: number, col: number) => `${row}-${col}`;

const cloneBoard = (matrix: Square[][]) =>
  matrix.map((row) => row.map((piece) => (piece ? { ...piece } : null)));

const applyPreviewMove = (matrix: Square[][], move: Move): Square[][] => {
  const board = cloneBoard(matrix);
  const piece = board[move.from.row][move.from.col];
  if (!piece) return board;
  board[move.from.row][move.from.col] = null;
  board[move.to.row][move.to.col] = { ...piece };
  if (piece.type === "pawn") {
    const lastRank = piece.color === "white" ? 7 : 0;
    if (move.to.row === lastRank) {
      board[move.to.row][move.to.col] = {
        type: move.promotion ?? "queen",
        color: piece.color,
        hasMoved: true,
      };
    }
  }
  return board;
};

const evaluateBoard = (matrix: Square[][], focus: Color) => {
  let total = 0;
  matrix.forEach((row) =>
    row.forEach((piece) => {
      if (!piece) return;
      const value = pieceValues[piece.type];
      total += piece.color === focus ? value : -value;
    }),
  );
  return total;
};

const ChessGame: React.FC<GameComponentProps> = ({ resetSignal, onScoreUpdate }) => {
  const engineRef = useRef(new Engine());
  const [board, setBoard] = useState<Square[][]>(engineRef.current.getBoard());
  const [selected, setSelected] = useState<Position | null>(null);
  const [legalTargets, setLegalTargets] = useState<Set<string>>(new Set());
  const [captured, setCaptured] = useState<Record<Color, string[]>>({
    white: [],
    black: [],
  });
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [status, setStatus] = useState("White to move");
  const [checkMessage, setCheckMessage] = useState<string | null>(null);
  const [playVsAi, setPlayVsAi] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "normal" | "hard">("normal");
  const [aiThinking, setAiThinking] = useState(false);

  useEffect(() => {
    resetBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  useEffect(() => {
    onScoreUpdate(captured.white.length + captured.black.length);
  }, [captured, onScoreUpdate]);

  useEffect(() => {
    if (!playVsAi) return;
    const engine = engineRef.current;
    if (engine.isGameOver()) return;
    if (engine.getTurn() !== "black") return;
    setAiThinking(true);
    const id = setTimeout(() => {
      const move = chooseAiMove();
      if (!move) {
        setAiThinking(false);
        return;
      }
      engine.makeMove(move);
      setBoard(engine.getBoard());
      setLastMove(move);
      setSelected(null);
      setLegalTargets(new Set());
      setAiThinking(false);
      updateStatus();
    }, aiDifficulty === "hard" ? 450 : 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, playVsAi, aiDifficulty]);

  const resetBoard = () => {
    const engine = engineRef.current;
    engine.reset();
    setBoard(engine.getBoard());
    setCaptured({ white: [], black: [] });
    setSelected(null);
    setLegalTargets(new Set());
    setLastMove(null);
    setStatus("White to move");
    setCheckMessage(null);
    setAiThinking(false);
  };

  const updateStatus = () => {
    const engine = engineRef.current;
    if (engine.isGameOver()) {
      const winner = engine.getWinner();
      if (winner && winner !== "draw") {
        setStatus(`Checkmate – ${colorName[winner]} wins`);
        setCheckMessage(null);
      } else {
        setStatus("Stalemate (draw)");
        setCheckMessage(null);
      }
      return;
    }
    const turn = engine.getTurn();
    if (engine.isCheck(turn)) {
      const message = `${colorName[turn]} is in check!`;
      setStatus(message);
      setCheckMessage(message);
      return;
    }
    setCheckMessage(null);
    setStatus(`${colorName[turn]} to move`);
  };

  const captureSymbol = (piece: Piece) => pieceSymbols[piece.color][piece.type];

  const handleSquare = (row: number, col: number) => {
    const engine = engineRef.current;
    if (engine.isGameOver()) return;
    if (playVsAi && (engine.getTurn() === "black" || aiThinking)) return;
    const piece = engine.getPiece(row, col);
    const currentTurn = engine.getTurn();
    if (selected) {
      const move: Move = {
        from: selected,
        to: { row, col },
      };
      if (engine.isLegalMove(move)) {
        const taken = engine.getPiece(row, col);
        if (taken) {
          const capturedBy = taken.color === "white" ? "black" : "white";
          setCaptured((prev) => ({
            ...prev,
            [capturedBy]: [...prev[capturedBy], captureSymbol(taken)],
          }));
        }
        engine.makeMove(move);
        setBoard(engine.getBoard());
        setLastMove(move);
        setSelected(null);
        setLegalTargets(new Set());
        updateStatus();
        return;
      }
      if (piece && piece.color === currentTurn) {
        selectSquare(row, col, piece.color);
        return;
      }
      setSelected(null);
      setLegalTargets(new Set());
      return;
    }
    if (piece && piece.color === currentTurn) {
      selectSquare(row, col, piece.color);
    }
  };

  const selectSquare = (row: number, col: number, color: Color) => {
    const engine = engineRef.current;
    setSelected({ row, col });
    const moves = engine.getLegalMovesFor({ row, col });
    setLegalTargets(new Set(moves.map((move) => buildKey(move.to.row, move.to.col))));
    setStatus(`${colorName[color]} selected`);
  };

  const getSquareClasses = (row: number, col: number) => {
    const isLight = (row + col) % 2 === 0;
    const classes = ["chess-square", isLight ? "square-light" : "square-dark"];
    if (selected && selected.row === row && selected.col === col) {
      classes.push("square-selected");
    }
    if (legalTargets.has(buildKey(row, col))) {
      classes.push("square-legal");
    }
    if (
      lastMove &&
      (buildKey(row, col) === buildKey(lastMove.from.row, lastMove.from.col) ||
        buildKey(row, col) === buildKey(lastMove.to.row, lastMove.to.col))
    ) {
      classes.push("square-last");
    }
    return classes.join(" ");
  };

  const gatherLegalMoves = () => {
    const engine = engineRef.current;
    const boardState = engine.getBoard();
    const moves: Move[] = [];
    for (let r = 0; r < 8; r += 1) {
      for (let c = 0; c < 8; c += 1) {
        const square = boardState[r][c];
        if (!square || square.color !== engine.getTurn()) continue;
        const squareMoves = engine.getLegalMovesFor({ row: r, col: c });
        moves.push(...squareMoves);
      }
    }
    return { moves, boardState };
  };

  const chooseAiMove = (): Move | null => {
    const engine = engineRef.current;
    const aiColor = engine.getTurn();
    const { moves, boardState } = gatherLegalMoves();
    if (!moves.length) return null;
    if (aiDifficulty === "easy") {
      return moves[Math.floor(Math.random() * moves.length)];
    }
    if (aiDifficulty === "normal") {
      const captures = moves.filter((move) => {
        const target = boardState[move.to.row][move.to.col];
        return Boolean(target);
      });
      const pool = captures.length ? captures : moves;
      return pool[Math.floor(Math.random() * pool.length)];
    }
    let bestMove = moves[0];
    let bestScore = -Infinity;
    moves.forEach((move) => {
      const preview = applyPreviewMove(boardState, move);
      const score = evaluateBoard(preview, aiColor);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    });
    return bestMove;
  };

  const toggleAiMode = () => {
    setPlayVsAi((prev) => {
      const next = !prev;
      resetBoard();
      return next;
    });
  };

  const buildCapturedList = (side: Color) =>
    captured[side].map((symbol, index) => (
      <span key={`${symbol}-${side}-${index}`} className={`captured ${side}`}>
        {symbol}
      </span>
    ));

  const currentTurn = engineRef.current.getTurn();
  const rowIndices = Array.from({ length: board.length }, (_, idx) => board.length - 1 - idx);

  return (
    <div className="chess-area">
      <div className="chess-info">
        <div>
          <p className="modal-description status-text">
            {aiThinking ? "AI thinking..." : status}
          </p>
          <p className="modal-description subtle-text">Turn: {colorName[currentTurn]}</p>
        </div>
        <div className="capture-row">
          <div>
            <p className="modal-description">White captures</p>
            <div className="capture-strip">{buildCapturedList("white")}</div>
          </div>
          <div>
            <p className="modal-description">Black captures</p>
            <div className="capture-strip">{buildCapturedList("black")}</div>
          </div>
        </div>
      </div>
      <div className="chess-controls">
        <button type="button" className="hero-button" onClick={toggleAiMode}>
          {playVsAi ? "Play with a friend" : "Play vs AI"}
        </button>
        {playVsAi && (
          <div className="difficulty-options chess">
            {(["easy", "normal", "hard"] as const).map((level) => (
              <button
                key={level}
                type="button"
                className={`difficulty-pill ${aiDifficulty === level ? "active" : ""}`}
                onClick={() => setAiDifficulty(level)}
              >
                {level}
              </button>
            ))}
          </div>
        )}
      </div>
      {checkMessage && <div className="check-alert">{checkMessage}</div>}
      <div className="chess-board">
        {rowIndices.map((rowIndex) =>
          board[rowIndex].map((piece, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              type="button"
              className={getSquareClasses(rowIndex, colIndex)}
              onClick={() => handleSquare(rowIndex, colIndex)}
            >
              <span className="chess-piece">
                {piece ? pieceSymbols[piece.color][piece.type] : ""}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChessGame;
