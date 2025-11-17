import { useEffect, useState } from "react";
import type { GameComponentProps } from "../types/game";

// Styled after card-flip memory trainers: progress stats plus animated flip interactions.

// Inspired by card-flip memory layouts on major brain-training sites.

const symbols = ["🍒", "🍇", "🍋", "🍓", "🍉", "🍑", "🍍", "🥭"];

interface Card {
  id: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
}

const createDeck = (): Card[] =>
  symbols
    .concat(symbols)
    .map((symbol, index) => ({ id: index, symbol, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5);

const MemoryGame: React.FC<GameComponentProps> = ({ onScoreUpdate, resetSignal }) => {
  const [deck, setDeck] = useState<Card[]>(createDeck());
  const [selection, setSelection] = useState<Card[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    setDeck(createDeck());
    setSelection([]);
    setMatches(0);
    setMoves(0);
  }, [resetSignal]);

  useEffect(() => {
    onScoreUpdate(matches);
  }, [matches, onScoreUpdate]);

  const handleFlip = (card: Card) => {
    if (card.flipped || card.matched || selection.length === 2) return;
    const updated = deck.map((entry) =>
      entry.id === card.id ? { ...entry, flipped: true } : entry
    );
    const nextSelection = [...selection, { ...card, flipped: true }];
    setDeck(updated);
    setSelection(nextSelection);
    if (nextSelection.length === 2) {
      setTimeout(() => evaluate(nextSelection), 600);
    }
    setMoves((prev) => prev + 1);
  };

  const evaluate = (pair: Card[]) => {
    if (pair[0].symbol === pair[1].symbol) {
      setDeck((prev) =>
        prev.map((entry) =>
          pair.some((p) => p.id === entry.id)
            ? { ...entry, matched: true }
            : { ...entry, flipped: false }
        )
      );
      setMatches((prev) => prev + 1);
    } else {
      setDeck((prev) =>
        prev.map((entry) =>
          pair.some((p) => p.id === entry.id) ? { ...entry, flipped: false } : entry
        )
      );
    }
    setSelection([]);
  };

  return (
    <div>
      <p className="modal-description">Match all pastel pairs!</p>
      <div className="memory-grid">
        {deck.map((card) => (
          <button
            key={card.id}
            className={`memory-card ${card.flipped || card.matched ? "revealed" : ""}`}
            onClick={() => handleFlip(card)}
          >
            <span className="memory-card-inner front">{card.symbol}</span>
            <span className="memory-card-inner back">❔</span>
          </button>
        ))}
    </div>
      <div className="memory-stats">
        <span>Moves: {moves}</span>
        <span>Matches: {matches}</span>
      </div>
    </div>
  );
};

export default MemoryGame;
