export type Color = "white" | "black";
export type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";

export interface Piece {
  type: PieceType;
  color: Color;
  hasMoved: boolean;
}

export type Square = Piece | null;

export interface Move {
  from: { row: number; col: number };
  to: { row: number; col: number };
  promotion?: PieceType;
}

function cloneBoard(board: Square[][]): Square[][] {
  return board.map((row) => row.map((piece) => (piece ? { ...piece } : null)));
}

function isOnBoard(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

export class ChessGame {
  private board: Square[][];
  private turn: Color;
  private gameOver: boolean;
  private winner: Color | "draw" | null;

  constructor() {
    this.board = this.createStartingBoard();
    this.turn = "white";
    this.gameOver = false;
    this.winner = null;
  }

  reset() {
    this.board = this.createStartingBoard();
    this.turn = "white";
    this.gameOver = false;
    this.winner = null;
  }

  getBoard(): Square[][] {
    return cloneBoard(this.board);
  }

  getTurn(): Color {
    return this.turn;
  }

  isGameOver(): boolean {
    return this.gameOver;
  }

  getWinner(): Color | "draw" | null {
    return this.winner;
  }

  isCheck(color: Color): boolean {
    return this.isKingInCheck(color, this.board);
  }

  getLegalMovesFor(square: { row: number; col: number }): Move[] {
    const piece = this.getPiece(square.row, square.col);
    if (!piece || piece.color !== this.turn) return [];
    const savedTurn = this.turn;
    const savedGameOver = this.gameOver;
    this.turn = piece.color;
    this.gameOver = false;
    const moves: Move[] = [];

    for (let r = 0; r < 8; r += 1) {
      for (let c = 0; c < 8; c += 1) {
        if (r === square.row && c === square.col) continue;
        const move: Move = {
          from: square,
          to: { row: r, col: c },
        };
        if (this.runWithTempState(() => this.isLegalMove(move))) {
          moves.push(move);
        }
      }
    }

    this.turn = savedTurn;
    this.gameOver = savedGameOver;
    return moves;
  }

  private createStartingBoard(): Square[][] {
    const makePiece = (type: PieceType, color: Color): Piece => ({
      type,
      color,
      hasMoved: false,
    });

    return [
      [
        makePiece("rook", "white"),
        makePiece("knight", "white"),
        makePiece("bishop", "white"),
        makePiece("queen", "white"),
        makePiece("king", "white"),
        makePiece("bishop", "white"),
        makePiece("knight", "white"),
        makePiece("rook", "white"),
      ],
      Array(8)
        .fill(null)
        .map(() => makePiece("pawn", "white")),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8)
        .fill(null)
        .map(() => makePiece("pawn", "black")),
      [
        makePiece("rook", "black"),
        makePiece("knight", "black"),
        makePiece("bishop", "black"),
        makePiece("queen", "black"),
        makePiece("king", "black"),
        makePiece("bishop", "black"),
        makePiece("knight", "black"),
        makePiece("rook", "black"),
      ],
    ];
  }

  getPiece(row: number, col: number): Square {
    if (!isOnBoard(row, col)) return null;
    return this.board[row][col];
  }

  isLegalMove(move: Move): boolean {
    if (this.gameOver) return false;

    const { from, to } = move;
    if (!isOnBoard(from.row, from.col) || !isOnBoard(to.row, to.col)) return false;
    if (from.row === to.row && from.col === to.col) return false;

    const piece = this.getPiece(from.row, from.col);
    if (!piece) return false;
    if (piece.color !== this.turn) return false;

    const target = this.getPiece(to.row, to.col);
    if (target && target.color === piece.color) return false;

    if (!this.isLegalPattern(piece, from, to, target)) return false;

    const boardCopy = cloneBoard(this.board);
    this.applyMoveOnBoard(boardCopy, move);

    if (this.isKingInCheck(this.turn, boardCopy)) {
      return false;
    }

    return true;
  }

  makeMove(move: Move): boolean {
    if (!this.isLegalMove(move)) return false;

    this.applyMoveOnBoard(this.board, move);
    this.turn = this.turn === "white" ? "black" : "white";
    this.updateGameState();
    return true;
  }

  private updateGameState() {
    if (this.hasLegalMovesFor(this.turn)) {
      this.gameOver = false;
      this.winner = null;
      return;
    }

    if (this.isKingInCheck(this.turn, this.board)) {
      this.gameOver = true;
      this.winner = this.turn === "white" ? "black" : "white";
    } else {
      this.gameOver = true;
      this.winner = "draw";
    }
  }

  private hasLegalMovesFor(color: Color): boolean {
    const savedTurn = this.turn;
    const savedGameOver = this.gameOver;
    this.turn = color;
    this.gameOver = false;

    for (let r = 0; r < 8; r += 1) {
      for (let c = 0; c < 8; c += 1) {
        const piece = this.getPiece(r, c);
        if (!piece || piece.color !== color) continue;
        for (let tr = 0; tr < 8; tr += 1) {
          for (let tc = 0; tc < 8; tc += 1) {
            if (tr === r && tc === c) continue;
            const candidate: Move = {
              from: { row: r, col: c },
              to: { row: tr, col: tc },
            };
            if (this.runWithTempState(() => this.isLegalMove(candidate))) {
              this.turn = savedTurn;
              this.gameOver = savedGameOver;
              return true;
            }
          }
        }
      }
    }

    this.turn = savedTurn;
    this.gameOver = savedGameOver;
    return false;
  }

  private isLegalPattern(
    piece: Piece,
    from: { row: number; col: number },
    to: { row: number; col: number },
    target: Square,
  ): boolean {
    const dr = to.row - from.row;
    const dc = to.col - from.col;

    switch (piece.type) {
      case "pawn":
        return this.isLegalPawnMove(piece, from, target, dr, dc);
      case "rook":
        return this.isLegalRookMove(from, to);
      case "knight":
        return this.isLegalKnightMove(dr, dc);
      case "bishop":
        return this.isLegalBishopMove(from, to);
      case "queen":
        return this.isLegalQueenMove(from, to);
      case "king":
        return this.isLegalKingMove(dr, dc);
      default:
        return false;
    }
  }

  private isLegalPawnMove(
    piece: Piece,
    from: { row: number; col: number },
    target: Square,
    dr: number,
    dc: number,
  ): boolean {
    const direction = piece.color === "white" ? 1 : -1;
    const startRow = piece.color === "white" ? 1 : 6;

    if (dc === 0) {
      if (dr === direction && !target) return true;
      if (dr === 2 * direction && from.row === startRow && !target) {
        const intermediateRow = from.row + direction;
        if (!this.getPiece(intermediateRow, from.col)) {
          return true;
        }
      }
      return false;
    }

    if (Math.abs(dc) === 1 && dr === direction) {
      if (target && target.color !== piece.color) {
        return true;
      }
      return false;
    }

    return false;
  }

  private isPathClearStraight(from: { row: number; col: number }, to: { row: number; col: number }): boolean {
    const dr = Math.sign(to.row - from.row);
    const dc = Math.sign(to.col - from.col);

    let r = from.row + dr;
    let c = from.col + dc;

    while (r !== to.row || c !== to.col) {
      if (this.getPiece(r, c)) return false;
      r += dr;
      c += dc;
    }
    return true;
  }

  private isLegalRookMove(from: { row: number; col: number }, to: { row: number; col: number }): boolean {
    if (from.row !== to.row && from.col !== to.col) return false;
    return this.isPathClearStraight(from, to);
  }

  private isLegalKnightMove(dr: number, dc: number): boolean {
    return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
  }

  private isLegalBishopMove(from: { row: number; col: number }, to: { row: number; col: number }): boolean {
    const dr = to.row - from.row;
    const dc = to.col - from.col;
    if (Math.abs(dr) !== Math.abs(dc)) return false;
    return this.isPathClearStraight(from, to);
  }

  private isLegalQueenMove(from: { row: number; col: number }, to: { row: number; col: number }): boolean {
    const dr = to.row - from.row;
    const dc = to.col - from.col;
    const straight = from.row === to.row || from.col === to.col;
    const diagonal = Math.abs(dr) === Math.abs(dc);
    if (!straight && !diagonal) return false;
    return this.isPathClearStraight(from, to);
  }

  private isLegalKingMove(dr: number, dc: number): boolean {
    if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1) {
      return true;
    }
    return false;
  }

  private applyMoveOnBoard(board: Square[][], move: Move): void {
    const { from, to, promotion } = move;
    const piece = board[from.row][from.col];
    if (!piece) return;

    board[from.row][from.col] = null;
    board[to.row][to.col] = { ...piece, hasMoved: true };

    if (piece.type === "pawn") {
      const lastRank = piece.color === "white" ? 7 : 0;
      if (to.row === lastRank) {
        const newType: PieceType = promotion ?? "queen";
        board[to.row][to.col] = {
          type: newType,
          color: piece.color,
          hasMoved: true,
        };
      }
    }
  }

  private isKingInCheck(color: Color, board: Square[][]): boolean {
    let kingPos: { row: number; col: number } | null = null;

    for (let r = 0; r < 8; r += 1) {
      for (let c = 0; c < 8; c += 1) {
        const piece = board[r][c];
        if (piece && piece.type === "king" && piece.color === color) {
          kingPos = { row: r, col: c };
          break;
        }
      }
      if (kingPos) break;
    }

    if (!kingPos) return true;

    const enemyColor: Color = color === "white" ? "black" : "white";

    for (let r = 0; r < 8; r += 1) {
      for (let c = 0; c < 8; c += 1) {
        const piece = board[r][c];
        if (!piece || piece.color !== enemyColor) continue;
        if (this.canPieceAttackSquare(board, piece, { row: r, col: c }, kingPos)) {
          return true;
        }
      }
    }

    return false;
  }

  private canPieceAttackSquare(
    board: Square[][],
    piece: Piece,
    from: { row: number; col: number },
    to: { row: number; col: number },
  ): boolean {
    const dr = to.row - from.row;
    const dc = to.col - from.col;

    const pathClearStraight = (start: { row: number; col: number }, end: { row: number; col: number }): boolean => {
      const dRow = Math.sign(end.row - start.row);
      const dCol = Math.sign(end.col - start.col);
      let r = start.row + dRow;
      let c = start.col + dCol;
      while (r !== end.row || c !== end.col) {
        if (board[r][c]) return false;
        r += dRow;
        c += dCol;
      }
      return true;
    };

    switch (piece.type) {
      case "pawn": {
        const direction = piece.color === "white" ? 1 : -1;
        return dr === direction && Math.abs(dc) === 1;
      }
      case "rook": {
        if (from.row !== to.row && from.col !== to.col) return false;
        return pathClearStraight(from, to);
      }
      case "knight": {
        return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
      }
      case "bishop": {
        if (Math.abs(dr) !== Math.abs(dc)) return false;
        return pathClearStraight(from, to);
      }
      case "queen": {
        const straight = from.row === to.row || from.col === to.col;
        const diagonal = Math.abs(dr) === Math.abs(dc);
        if (!straight && !diagonal) return false;
        return pathClearStraight(from, to);
      }
      case "king": {
        return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
      }
      default:
        return false;
    }
  }

  private runWithTempState<T>(fn: () => T): T {
    const savedTurn = this.turn;
    const savedGameOver = this.gameOver;
    try {
      return fn();
    } finally {
      this.turn = savedTurn;
      this.gameOver = savedGameOver;
    }
  }
}
