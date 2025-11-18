import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header";
import DropdownMenu from "./components/DropdownMenu";
import Home from "./pages/Home";
import GamePage from "./pages/GamePage";
import RecentGamesPanel from "./components/RecentGamesPanel";
import StatsPanel from "./components/StatsPanel";
import { games } from "./data/games";
import type { GameDefinition, TicTacToeDifficulty } from "./types/game";

const HIGH_SCORES_KEY = "happy-mini-arcade-scores";
const THEME_KEY = "happy-mini-arcade-theme";
const RECENT_KEY = "happy-mini-arcade-recent";

const App: React.FC = () => {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [recentGames, setRecentGames] = useState<string[]>([]);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return (stored as "light" | "dark") ?? "dark";
  });
  const [resetSignal, setResetSignal] = useState(0);
  const [tttDifficulty, setTttDifficulty] = useState<TicTacToeDifficulty>(
    () => (localStorage.getItem("ttt-difficulty") as TicTacToeDifficulty) ?? "normal"
  );
  const scrollMemoryRef = useRef(0);

  useEffect(() => {
    const stored = localStorage.getItem(HIGH_SCORES_KEY);
    if (stored) setScores(JSON.parse(stored));
    const recent = localStorage.getItem(RECENT_KEY);
    if (recent) {
      try {
        setRecentGames(JSON.parse(recent));
      } catch {
        setRecentGames([]);
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores));
  }, [scores]);

  const selectedGame = useMemo<GameDefinition | null>(
    () => games.find((game) => game.id === selectedGameId) ?? null,
    [selectedGameId]
  );

  const recentTitles = useMemo(
    () =>
      recentGames
        .map((id) => games.find((game) => game.id === id)?.name)
        .filter(Boolean) as string[],
    [recentGames]
  );

  const topGames = useMemo(
    () =>
      Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([id, score]) => ({
          name: games.find((game) => game.id === id)?.name ?? id,
          score,
        })),
    [scores]
  );

  const handleSelectGame = (id: string) => {
    scrollMemoryRef.current = window.scrollY;
    setSelectedGameId(id);
    setGamesPlayed((prev) => prev + 1);
    setRecentGames((prev) => {
      const next = [id, ...prev.filter((entry) => entry !== id)].slice(0, 8);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleRandomGame = () => {
    const available = games.filter((game) => game.id !== selectedGameId);
    const choice = available[Math.floor(Math.random() * available.length)] ?? games[0];
    handleSelectGame(choice.id);
  };

  const restoreScroll = () => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollMemoryRef.current, behavior: "auto" });
    });
  };

  const handleBack = () => {
    setSelectedGameId(null);
    restoreScroll();
  };
  const handleGoHome = () => {
    setSelectedGameId(null);
    setMenuOpen(false);
    restoreScroll();
  };

  const handleRestart = () => {
    setResetSignal((prev) => prev + 1);
  };

  const handleOpenStats = () => {
    setShowStats(true);
    setMenuOpen(false);
  };
  const handleCloseStats = () => setShowStats(false);
  const handleOpenRecent = () => {
    setShowRecent(true);
    setMenuOpen(false);
  };

  const handleHighScore = (score: number) => {
    if (!selectedGame) return;
    setScores((prev) => {
      const existing = prev[selectedGame.id] ?? 0;
      if (score <= existing) return prev;
      return { ...prev, [selectedGame.id]: score };
    });
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  useEffect(() => {
    const handler = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!menuOpen || !target) return;
      if (
        (menuPanelRef.current && menuPanelRef.current.contains(target)) ||
        (menuButtonRef.current && menuButtonRef.current.contains(target))
      ) {
        return;
      }
      setMenuOpen(false);
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [menuOpen]);

  return (
    <>
      <div className="menu-bar-wrapper">
        <Header
          onMenuToggle={toggleMenu}
          menuOpen={menuOpen}
          buttonRef={menuButtonRef}
          onLogoClick={handleGoHome}
        />
        <DropdownMenu
          open={menuOpen}
          onThemeToggle={toggleTheme}
          currentTheme={theme}
          panelRef={menuPanelRef}
          onStats={handleOpenStats}
        />
      </div>
      <main className="app-content">
        {!selectedGame && (
          <Home
            games={games}
            bestScores={scores}
            onSelect={handleSelectGame}
            onRandom={handleRandomGame}
            onRecent={handleOpenRecent}
          />
        )}
        {selectedGame && (
          <GamePage
            game={selectedGame}
            bestScore={scores[selectedGame.id] ?? null}
            onBack={handleBack}
            onRestart={handleRestart}
            onRandom={handleRandomGame}
            onScoreUpdate={() => {}}
            onHighScore={handleHighScore}
            resetSignal={resetSignal}
            difficulty={tttDifficulty}
            onDifficultyChange={(value) => {
              setTttDifficulty(value);
              localStorage.setItem("ttt-difficulty", value);
            }}
          />
        )}
        {showStats && (
          <StatsPanel
            open={showStats}
            gamesPlayed={gamesPlayed}
            topGames={topGames}
            onClose={handleCloseStats}
          />
        )}
        {showRecent && (
          <RecentGamesPanel
            open={showRecent}
            recentGames={recentTitles}
            onClose={() => setShowRecent(false)}
          />
        )}
      </main>
    </>
  );
};

export default App;
