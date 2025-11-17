import { useEffect, useMemo, useState } from "react";
import type { GameComponentProps } from "../types/game";

type Card = {
  rank: string;
  suit: string;
  id: string;
};

const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const suits = ["♥", "♦", "♣", "♠"];

const createDeck = (): Card[] =>
  suits.flatMap((suit) =>
    ranks.map((rank) => ({
      rank,
      suit,
      id: `${rank}${suit}`,
    }))
  );

const shuffleDeck = (deck: Card[]) => {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const cardValue = (card: Card) => {
  if (card.rank === "A") return 11;
  if (["J", "Q", "K"].includes(card.rank)) return 10;
  return Number(card.rank);
};

const handValue = (hand: Card[]) => {
  let total = 0;
  let aces = 0;
  hand.forEach((card) => {
    total += cardValue(card);
    if (card.rank === "A") aces += 1;
  });
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
};

const BlackjackGame: React.FC<GameComponentProps> = ({
  resetSignal,
  onScoreUpdate,
}) => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [phase, setPhase] = useState<"idle" | "player" | "dealer" | "result">("idle");
  const [message, setMessage] = useState("Press Start to deal.");
  const [resultLabel, setResultLabel] = useState<string | null>(null);

  const playerTotal = useMemo(() => handValue(playerHand), [playerHand]);
  const dealerTotal = useMemo(() => handValue(dealerHand), [dealerHand]);

  useEffect(() => {
    resetToIdle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  const startRound = () => {
    const freshDeck = shuffleDeck(createDeck());
    const player = [freshDeck.pop()!, freshDeck.pop()!];
    const dealer = [freshDeck.pop()!, freshDeck.pop()!];
    setDeck(freshDeck);
    setPlayerHand(player);
    setDealerHand(dealer);
    setPhase("player");
    setMessage("Hit or Stand to play.");
    setResultLabel(null);
  };

  const resetToIdle = () => {
    setDeck([]);
    setPlayerHand([]);
    setDealerHand([]);
    setPhase("idle");
    setMessage("Press Start to deal.");
    setResultLabel(null);
  };

  const drawCard = (currentDeck: Card[]) => {
    const nextDeck = [...currentDeck];
    const card = nextDeck.pop()!;
    return { card, nextDeck };
  };

  const handleHit = () => {
    if (phase !== "player") return;
    const { card, nextDeck } = drawCard(deck);
    const nextHand = [...playerHand, card];
    setPlayerHand(nextHand);
    setDeck(nextDeck);
    if (handValue(nextHand) > 21) {
      setPhase("result");
      setResultLabel("Bust! Dealer wins.");
      setMessage("You busted.");
      onScoreUpdate(0);
    }
  };

  const handleStand = () => {
    setPhase("dealer");
    setMessage("Dealer drawing...");
    dealerTurn(dealerHand, deck);
  };

  const dealerTurn = (currentDealer: Card[], currentDeck: Card[]) => {
    let dealerCards = [...currentDealer];
    let current = [...currentDeck];
    while (handValue(dealerCards) < 17) {
      const draw = drawCard(current);
      dealerCards = [...dealerCards, draw.card];
      current = draw.nextDeck;
    }
    setDealerHand(dealerCards);
    setDeck(current);
    evaluateWinner(dealerCards);
  };

  const evaluateWinner = (dealerCards: Card[]) => {
    const dealerScore = handValue(dealerCards);
    const playerScore = handValue(playerHand);
    let label = "";
    if (dealerScore > 21 || playerScore > dealerScore) {
      label = "You win!";
      onScoreUpdate(playerScore);
    } else if (playerScore === dealerScore) {
      label = "Push (tie).";
      onScoreUpdate(playerScore);
    } else {
      label = "Dealer wins.";
      onScoreUpdate(0);
    }
    setPhase("result");
    setResultLabel(label);
    setMessage(label);
  };

  return (
    <div className="blackjack-area">
      <div className="blackjack-board">
        <div className="blackjack-column">
          <h3>Player</h3>
          <p className="modal-description">Total: {playerTotal}</p>
          <div className="blackjack-cards">
            {playerHand.map((card) => (
              <div key={card.id} className="blackjack-card">
                <span className="card-rank">{card.rank}</span>
                <span className="card-suit">{card.suit}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="blackjack-column">
          <h3>Dealer</h3>
          <p className="modal-description">Total: {phase === "result" ? dealerTotal : "??"}</p>
          <div className="blackjack-cards">
            {dealerHand.map((card, index) => (
              <div
                key={card.id}
                className={`blackjack-card ${index === 0 && phase !== "result" ? "hidden-card" : ""}`}
              >
                <span className="card-rank">{card.rank}</span>
                <span className="card-suit">{card.suit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="modal-description" style={{ marginTop: 12 }}>
        {message}
      </p>
      {resultLabel && (
        <p className="modal-description highlight">{resultLabel}</p>
      )}
      <div className="game-actions">
        {phase === "idle" && (
          <button type="button" onClick={startRound}>
            Start
          </button>
        )}
        <button type="button" onClick={handleHit} disabled={phase !== "player"}>
          Hit
        </button>
        <button type="button" onClick={handleStand} disabled={phase !== "player"}>
          Stand
        </button>
        <button type="button" onClick={resetToIdle}>
          Restart
        </button>
      </div>
    </div>
  );
};

export default BlackjackGame;
