'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

type GamePhase = 'idle' | 'memorize' | 'playing' | 'success' | 'gameover';

export default function PatternGame() {
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [activeTiles, setActiveTiles] = useState<number[]>([]);
  const [playerTiles, setPlayerTiles] = useState<number[]>([]);
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [highScore, setHighScore] = useState(0);

  // Calculate grid size and tiles based on level
  // Levels 1-2: 3x3 grid. Levels 3-5: 4x4. Levels 6+: 5x5.
  const gridSize = Math.min(5, 3 + Math.floor((level - 1) / 2));
  const totalCells = gridSize * gridSize;
  const tilesToRemember = level + 2; // Lvl 1 = 3 tiles, Lvl 2 = 4 tiles...

  useEffect(() => {
    const saved = localStorage.getItem('pattern_highscore');
    if (saved) {
      // eslint-disable-next-line
      setHighScore(parseInt(saved));
    }
  }, []);

  const startLevel = (currentLevel: number) => {
    setPlayerTiles([]);
    setWrongTile(null);
    setPhase('memorize');

    // Generate unique tiles to memorize
    const currentGridSize = Math.min(5, 3 + Math.floor((currentLevel - 1) / 2));
    const currentTotalCells = currentGridSize * currentGridSize;
    const currentTilesToRemember = currentLevel + 2;

    const newActiveTiles = new Set<number>();
    while (newActiveTiles.size < currentTilesToRemember) {
      // eslint-disable-next-line
      newActiveTiles.add(Math.floor(Math.random() * currentTotalCells));
    }
    setActiveTiles(Array.from(newActiveTiles));

    // Show tiles for 1.5 seconds (slightly longer on higher levels)
    const memorizeTime = Math.max(1000, 1500 + (currentLevel * 100));

    setTimeout(() => {
      setPhase('playing');
    }, memorizeTime);
  };

  const startGame = () => {
    setLevel(1);
    startLevel(1);
  };

  const handleTileClick = (index: number) => {
    if (phase !== 'playing' || playerTiles.includes(index)) return;

    if (activeTiles.includes(index)) {
      // CORRECT CLICK
      const newPlayerTiles = [...playerTiles, index];
      setPlayerTiles(newPlayerTiles);

      if (newPlayerTiles.length === activeTiles.length) {
        // LEVEL COMPLETED
        setPhase('success');
        setTimeout(() => {
          const nextLvl = level + 1;
          setLevel(nextLvl);
          startLevel(nextLvl);
        }, 1000);
      }
    } else {
      // WRONG CLICK! Clicked the wrong tile
      setWrongTile(index);
      setPhase('gameover');

      if (level > highScore) {
        setHighScore(level);
        localStorage.setItem('pattern_highscore', level.toString());
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      }
    }
  };

  // Dynamic grid classes for Tailwind
  const gridColsClass = gridSize === 3 ? 'grid-cols-3' : gridSize === 4 ? 'grid-cols-4' : 'grid-cols-5';
  const cellSizeClass = gridSize === 3 ? 'w-20 h-20 sm:w-28 sm:h-28' : gridSize === 4 ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-12 h-12 sm:w-16 sm:h-16';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 p-4 flex flex-col items-center overflow-x-hidden relative">
      <div className="w-full max-w-xl flex justify-between items-center mb-6 mt-2">
        <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform font-bold">
          ← Back to Menu
        </Link>
        <div className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors px-3 py-1 rounded-full font-bold text-xs sm:text-sm">
          🏆 High Score: Lvl {highScore}
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-black mb-2 text-slate-800 dark:text-slate-100 transition-colors">Pattern Memory 🧩</h1>
        {!phase.includes('gameover') && phase !== 'idle' && (
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto text-sm transition-colors">
            Memorize the highlighted tiles. Once they hide, click to reveal them!
          </p>
        )}
      </div>

      {phase !== 'idle' && (
        <div className="flex justify-center items-center gap-6 mb-6">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-6 py-2 rounded-xl font-black text-xl shadow-sm border-2 border-indigo-200 dark:border-indigo-800/50 transition-colors">
            Level: {level}
          </div>
        </div>
      )}

      {/* GAME BOARD */}
      <div className="relative bg-slate-200 dark:bg-slate-800 p-3 sm:p-4 rounded-3xl shadow-inner mb-8 transition-all duration-500 ease-in-out">
        <div className={`grid ${gridColsClass} gap-2 sm:gap-3 transition-all duration-500`}>
          {[...Array(totalCells)].map((_, index) => {
            const isMemorizePhase = phase === 'memorize';
            const isActive = activeTiles.includes(index);
            const isRevealed = playerTiles.includes(index);
            const isWrong = wrongTile === index;
            const missedTile = phase === 'gameover' && isActive && !isRevealed;

            // Logic for highlighting tiles (with dark mode support)
            let bgColor = 'bg-white dark:bg-slate-700 border border-transparent dark:border-slate-600';
            let hoverColor = phase === 'playing' ? 'hover:bg-slate-100 dark:hover:bg-slate-600' : '';

            if (isMemorizePhase && isActive) {
              bgColor = 'bg-indigo-500 dark:bg-indigo-600 shadow-indigo-500/50 shadow-lg';
              hoverColor = '';
            } else if (isRevealed) {
              bgColor = 'bg-emerald-500 dark:bg-emerald-600 shadow-emerald-500/50 shadow-lg';
              hoverColor = '';
            } else if (isWrong) {
              bgColor = 'bg-rose-500 dark:bg-rose-600 shadow-rose-500/50 shadow-lg';
              hoverColor = '';
            } else if (missedTile) {
              bgColor = 'bg-indigo-300 dark:bg-indigo-400 opacity-50'; // Show missed tiles after game over
              hoverColor = '';
            }

            return (
              <motion.button
                key={index}
                initial={false}
                animate={
                  isMemorizePhase && isActive ? { rotateY: 180, scale: 1.05 } :
                  isRevealed ? { rotateY: 180, scale: 1.05 } :
                  isWrong ? { rotateX: 180, scale: 1.1 } :
                  { rotateY: 0, scale: 1 }
                }
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                whileTap={phase === 'playing' && !isRevealed ? { scale: 0.9 } : {}}
                onClick={() => handleTileClick(index)}
                disabled={phase !== 'playing'}
                className={`${cellSizeClass} ${bgColor} ${hoverColor} rounded-xl sm:rounded-2xl transition-colors duration-200 cursor-pointer flex items-center justify-center
                  ${phase !== 'playing' ? 'pointer-events-none' : ''}
                `}
              >
                {/* Icons for win/loss inside tiles */}
                {isRevealed && <span className="text-white text-2xl sm:text-3xl font-bold" style={{ transform: 'rotateY(180deg)' }}>✓</span>}
                {isWrong && <span className="text-white text-2xl sm:text-3xl font-bold" style={{ transform: 'rotateX(180deg)' }}>✗</span>}
              </motion.button>
            );
          })}
        </div>

        {/* SUCCESS OVERLAY */}
        {phase === 'success' && (
          <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[2px] rounded-3xl z-10 transition-colors"></div>
        )}
      </div>

      {phase === 'gameover' && (
        <div className="text-center animate-in slide-in-from-bottom-4">
          <h2 className="text-3xl font-black text-rose-600 mb-2">Game Over!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium transition-colors">You reached <span className="font-black text-indigo-600 dark:text-indigo-400">Level {level}</span></p>
          <button
            onClick={startGame}
            className="px-10 py-4 bg-indigo-600 text-white rounded-full font-black text-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg"
          >
            TRY AGAIN
          </button>
        </div>
      )}

      {phase === 'idle' && (
        <button
          onClick={startGame}
          className="px-12 py-4 bg-indigo-600 text-white rounded-full font-black text-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg hover:shadow-indigo-500/30 animate-bounce z-0"
        >
          START GAME
        </button>
      )}
    </div>
  );
}