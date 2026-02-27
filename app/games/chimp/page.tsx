'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

type GamePhase = 'idle' | 'memorize' | 'playing' | 'gameover' | 'success';

type SquareData = {
  value: number; // 1 to level
  hidden: boolean;
  clicked: boolean;
  wrong?: boolean;
};

export default function ChimpGame() {
  const [level, setLevel] = useState(4); // Start with 4 numbers
  const [grid, setGrid] = useState<(SquareData | null)[]>(Array(25).fill(null)); // 5x5 Grid
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [nextExpected, setNextExpected] = useState(1);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('chimp_highscore');
    if (saved) {
      // eslint-disable-next-line
      setHighScore(parseInt(saved));
    }
  }, []);

  const startLevel = (currentLevel: number) => {
    const newGrid: (SquareData | null)[] = Array(25).fill(null);
    const positions = new Set<number>();

    // Generate unique random positions
    while (positions.size < currentLevel) {
      // eslint-disable-next-line
      positions.add(Math.floor(Math.random() * 25));
    }

    let currentValue = 1;
    positions.forEach(pos => {
      newGrid[pos] = { value: currentValue, hidden: false, clicked: false };
      currentValue++;
    });

    setGrid(newGrid);
    setNextExpected(1);
    setPhase('memorize');
  };

  const startGame = () => {
    setLevel(4);
    startLevel(4);
  };

  const handleSquareClick = (index: number) => {
    if (phase !== 'memorize' && phase !== 'playing') return;

    const square = grid[index];
    if (!square || square.clicked) return;

    if (square.value === nextExpected) {
      // CORRECT CLICK
      const newGrid = [...grid];
      newGrid[index] = { ...square, clicked: true };

      // Hide all numbers as soon as "1" is clicked
      if (square.value === 1) {
        setPhase('playing');
        for (let i = 0; i < 25; i++) {
          if (newGrid[i] && !newGrid[i]?.clicked) {
            newGrid[i] = { ...newGrid[i]!, hidden: true };
          }
        }
      }

      setGrid(newGrid);

      // Check for level completion
      if (nextExpected === level) {
        setPhase('success');
        setTimeout(() => {
          const nextLvl = level + 1;
          setLevel(nextLvl);
          startLevel(nextLvl);
        }, 1000); // Pause before next level
      } else {
        setNextExpected(prev => prev + 1);
      }

    } else {
      // WRONG CLICK
      setPhase('gameover');
      const newGrid = [...grid];

      // Reveal all hidden numbers so the player sees the mistake
      for (let i = 0; i < 25; i++) {
        if (newGrid[i]) {
          newGrid[i] = { ...newGrid[i]!, hidden: false };
        }
      }

      // Highlight the wrong square in red
      newGrid[index] = { ...square, hidden: false, wrong: true };
      setGrid(newGrid);

      // Score is calculated based on completed levels
      const completedLevels = level - 4;
      if (completedLevels > highScore) {
        setHighScore(completedLevels);
        localStorage.setItem('chimp_highscore', completedLevels.toString());
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 p-4 flex flex-col items-center overflow-x-hidden relative">
      <div className="w-full max-w-xl flex justify-between items-center mb-6 mt-2">
        <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform font-bold">
          ← Back to Menu
        </Link>
        <div className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full font-bold text-xs sm:text-sm transition-colors">
          🏆 High Score: {highScore}
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-black mb-2 text-slate-800 dark:text-slate-100 transition-colors">Chimp Test 🐒</h1>
        {!phase.includes('gameover') && phase !== 'idle' && (
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto text-sm transition-colors">
            Click the numbers in order. Once you click &quot;1&quot;, the rest will hide!
          </p>
        )}
      </div>

      {phase !== 'idle' && (
        <div className="flex justify-center items-center gap-6 mb-6">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-6 py-2 rounded-xl font-black text-xl shadow-sm border-2 border-indigo-200 dark:border-indigo-800/50 transition-colors">
            Numbers: {level}
          </div>
        </div>
      )}

      {/* GAME BOARD 5x5 */}
      <div className="relative bg-slate-200 dark:bg-slate-800 p-3 sm:p-4 rounded-3xl shadow-inner mb-8 transition-colors duration-500">
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {grid.map((square, index) => (
            <div
              key={index}
              className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center relative"
            >
              <AnimatePresence>
                {square && !square.clicked && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSquareClick(index)}
                    className={`absolute inset-0 w-full h-full rounded-xl shadow-md dark:shadow-none border-2 flex items-center justify-center text-2xl sm:text-4xl font-black transition-colors duration-200
                      ${square.wrong 
                        ? 'bg-rose-500 border-rose-600 text-white dark:border-rose-700' 
                        : 'bg-white border-slate-100 text-slate-800 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100'}
                    `}
                    disabled={phase === 'gameover' || phase === 'success'}
                  >
                    {/* Hide text visually but keep the button container visible */}
                    <span className={square.hidden ? 'opacity-0' : 'opacity-100 transition-opacity'}>
                      {square.value}
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* SUCCESS OVERLAY */}
        {phase === 'success' && (
          <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
            <span className="text-6xl animate-bounce drop-shadow-md">✅</span>
          </div>
        )}

        {/* GAME OVER OVERLAY */}
        {phase === 'gameover' && (
          <div className="absolute inset-0 bg-rose-500/10 backdrop-blur-[2px] rounded-3xl z-10 pointer-events-none"></div>
        )}
      </div>

      {phase === 'gameover' && (
        <div className="text-center animate-in slide-in-from-bottom-4">
          <h2 className="text-3xl font-black text-rose-600 mb-2">Game Over!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium transition-colors">You reached <span className="font-black text-indigo-600 dark:text-indigo-400">{level}</span> numbers.</p>
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
          START TEST
        </button>
      )}
    </div>
  );
}