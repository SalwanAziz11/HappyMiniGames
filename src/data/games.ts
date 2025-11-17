import RockPaperScissorsGame from "../games/RockPaperScissorsGame";
import TicTacToeGame from "../games/TicTacToeGame";
import MemoryGame from "../games/MemoryGame";
import ReflexGame from "../games/ReflexGame";
import SnakeGame from "../games/SnakeGame";
import ConnectFourGame from "../games/ConnectFourGame";
import ClickerGame from "../games/ClickerGame";
import ReactionGame from "../games/ReactionGame";
import GuessNumberGame from "../games/GuessNumberGame";
import TileMergeGame from "../games/TileMergeGame";
import ChessGame from "../games/ChessGame";
import BlackjackGame from "../games/BlackjackGame";
import type { GameDefinition } from "../types/game";

export const games: GameDefinition[] = [
  {
    id: "tictactoe",
    name: "Tic Tac Toe",
    icon: "⭕️",
    description: "Outwit a thoughtful AI on a pastel grid.",
    category: "Board",
    component: TicTacToeGame,
  },
  {
    id: "rps",
    name: "Rock Paper Scissors",
    icon: "✊📄✂️",
    description: "Build a winning streak against the CPU.",
    category: "Arcade",
    component: RockPaperScissorsGame,
  },
  {
    id: "memory",
    name: "Memory Match",
    icon: "🧠",
    description: "Flip pastel tiles and pair the icons.",
    category: "Puzzle",
    component: MemoryGame,
  },
  {
    id: "reflex",
    name: "Reflex Pop",
    icon: "💥",
    description: "Tap the bubble before the timer runs out.",
    category: "Reflex",
    component: ReflexGame,
  },
  {
    id: "snake",
    name: "Snake Sprint",
    icon: "🐍",
    description: "Grow the serpent without crashing into walls.",
    category: "Arcade",
    component: SnakeGame,
  },
  {
    id: "connectfour",
    name: "Connect Four",
    icon: "🟡🔴",
    description: "Drop discs and connect four in any direction.",
    category: "Board",
    component: ConnectFourGame,
  },
  {
    id: "clicker",
    name: "Hyper Clicker",
    icon: "👆",
    description: "Tap the glowing bubble to rack up points.",
    category: "Reflex",
    component: ClickerGame,
  },
  {
    id: "reaction",
    name: "Reaction Snap",
    icon: "⚡",
    description: "Tap as soon as the block turns green.",
    category: "Reflex",
    component: ReactionGame,
  },
  {
    id: "guessnumber",
    name: "Number Guess",
    icon: "🎯",
    description: "Crack the secret number in just a few tries.",
    category: "Puzzle",
    component: GuessNumberGame,
  },
  {
    id: "tilemerge",
    name: "Mini 2048",
    icon: "🧊",
    description: "Slide tiles and chase the big merge.",
    category: "Puzzle",
    component: TileMergeGame,
  },
  {
    id: "chess",
    name: "Chess Duel",
    icon: "♟️",
    description: "Classic 8x8 duel with friendly pastel pieces.",
    category: "Strategy",
    component: ChessGame,
  },
  {
    id: "blackjack",
    name: "Blackjack Table",
    icon: "🂡",
    description: "Friendly dealer challenge with Hit / Stand controls.",
    category: "Card",
    component: BlackjackGame,
  },
];

// To add a new game, create a component that follows GameComponentProps and
// append a new GameDefinition entry here. Cards, stats, and scores update automatically.
