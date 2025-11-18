import { useEffect, useRef, useState } from "react";
import type { GameComponentProps } from "../types/game";
import { ChessGame as Engine } from "./chessLogic";
import type { Color, Move, Piece, PieceType, Square } from "./chessLogic";

const pieceSymbols: Record<Color, Record<PieceType, string>> = {
  white: {
    pawn: "?",
    knight: "?",
    bishop: "?",
    rook: "?",
    queen: "?",
    king: "?",
  },
  black: {
    pawn: "?",
    knight: "?",
    bishop: "?",
    rook: "?",
    queen: "?",
    king: "?",
  },
};

const colorName: Record<Color, string> = {
  white: "White",
  black: "Black",
};

type Position = { row: number; col: number };

const buildKey = (row: number, col: number) => `${row}-${col}`;

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

  useEffect(() => {
    resetBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  useEffect(() => {
    onScoreUpdate(captured.white.length + captured.black.length);
  }, [captured, onScoreUpdate]);

  useEffect(() => {
    updateStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetBoard = () => {
    const engine = engineRef.current;
    engine.reset();
    setBoard(engine.getBoard());
    setCaptured({ white: [], black: [] });
    setSelected(null);
    setLegalTargets(new Set());
    setLastMove(null);
    setStatus("White to move");
  };

  const updateStatus = () => {
    const engine = engineRef.current;
    if (engine.isGameOver()) {
      const winner = engine.getWinner();
      if (winner && winner !== "draw") {
        setStatus(`Checkmate – ${colorName[winner]} wins`);
      } else {
        setStatus("Stalemate (draw)");
      }
      return;
    }
    const turn = engine.getTurn();
    if (engine.isCheck(turn)) {
      setStatus(`${colorName[turn]} is in check`);
      return;
    }
    setStatus(`${colorName[turn]} to move`);
  };

  const captureSymbol = (piece: Piece) => pieceSymbols[piece.color][piece.type];

  const handleSquare = (row: number, col: number) => {
    const engine = engineRef.current;
    if (engine.isGameOver()) return;
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
    if (lastMove && (buildKey(row, col) === buildKey(lastMove.from.row, lastMove.from.col) || buildKey(row, col) === buildKey(lastMove.to.row, lastMove.to.col))) {
      classes.push("square-last");
    }
    return classes.join(" ");
  };

  const buildCapturedList = (side: Color) =>
    captured[side].map((symbol, index) => (
      <span key={`${symbol}-${side}-${index}`} className={`captured ${side}`}>
        {symbol}
      </span>
    ));

  const currentTurn = engineRef.current.getTurn();

  return (
    <div className="chess-area">
      <div className="chess-info">
        <div>
          <p className="modal-description status-text">{status}</p>
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
      <div className="chess-board">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              type="button"
              className={getSquareClasses(rowIndex, colIndex)}
              onClick={() => handleSquare(rowIndex, colIndex)}
            >
              <span className="chess-piece">{piece ? pieceSymbols[piece.color][piece.type] : ""}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChessGame;

