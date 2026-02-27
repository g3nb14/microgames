'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function SchulteGame() {
  const [grid, setGrid] = useState<number[]>([]);
  const [nextExpected, setNextExpected] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0); // Time in milliseconds
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [wrongSquare, setWrongSquare] = useState<number | null>(null);

  // Load best result (lowest time)
  useEffect(() => {
    const saved = localStorage.getItem('schulte_best');
    if (saved) {
      // eslint-disable-next-line
      setBestTime(parseFloat(saved));
    }
  }, []);

  // Accurate stopwatch
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isPlaying) {
      const startTime = Date.now() - timeElapsed;
      intervalId = setInterval(() => {
        setTimeElapsed(Date.now() - startTime);
      }, 50); // Update UI every 50ms for smoothness
    }
    return () => clearInterval(intervalId);
  }, [isPlaying, timeElapsed]);

  const startGame = () => {
    // eslint-disable-next-line
    const nums = Array.from({ length: 25 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    setGrid(nums);
    setNextExpected(1);
    setTimeElapsed(0);
    setIsPlaying(true);
    setIsGameOver(false);
  };

  const handleSquareClick = (num: number) => {
    if (!isPlaying || isGameOver) return;

    if (num === nextExpected) {
      // CORRECT CLICK
      if (num === 25) {
        // VICTORY!
        setIsPlaying(false);
        setIsGameOver(true);

        const finalTime = timeElapsed / 1000;
        // Check if record is broken (or no record yet)
        if (bestTime === null || finalTime < bestTime) {
          setBestTime(finalTime);
          localStorage.setItem('schulte_best', finalTime.toString());
          confetti({ particleCount: 300, spread: 120, origin: { y: 0.5 } });
        }
      } else {
        setNextExpected(num + 1);
      }
    } else if (num > nextExpected) {
      // ERROR! Clicked too early
      setWrongSquare(num);
      setTimeout(() => setWrongSquare(null), 300); // Highlight error for 300ms
    }
  };

  // Format time to seconds with hundredths (e.g., 12.34)
  const formatTime = (ms: number) => (ms / 1000).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 p-4 flex flex-col items-center overflow-x-hidden relative">
      <div className="w-full max-w-xl flex justify-between items-center mb-6 mt-2">
        <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform font-bold">
          ← Back to Menu
        </Link>
        <div className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors px-3 py-1 rounded-full font-bold text-xs sm:text-sm">
          🏆 Best Time: {bestTime !== null ? `${bestTime}s` : '--'}
        </div>
      </div>

      <div className="text-center mb-4">
        <h1 className="text-3xl sm:text-4xl font-black mb-2 text-slate-800 dark:text-slate-100 transition-colors">Schulte Table 🔢</h1>
        {!isPlaying && !isGameOver && (
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto text-sm transition-colors">
            Find and click numbers from 1 to 25 as fast as you can. Keep your eyes on the center!
          </p>
        )}
      </div>

      {/* Scoreboard */}
      {(isPlaying || isGameOver) && (
        <div className="flex justify-center items-center gap-6 mb-6">
          <div className="text-slate-500 dark:text-slate-400 font-medium text-lg sm:text-xl transition-colors">
            Next: <span className="font-black text-3xl ml-2 text-indigo-600 dark:text-indigo-400">{nextExpected <= 25 ? nextExpected : '🎉'}</span>
          </div>
          <div className={`px-6 py-2 rounded-xl font-black text-2xl shadow-sm border-2 transition-colors
            ${isGameOver 
              ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50' 
              : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50'}`}>
            ⏱ {formatTime(timeElapsed)}s
          </div>
        </div>
      )}

      {/* 5x5 GAME BOARD */}
      <div className="relative bg-slate-200 dark:bg-slate-800 p-3 sm:p-4 rounded-3xl shadow-inner mb-8 transition-colors duration-500">
        {grid.length > 0 ? (
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {grid.map((num, index) => {
              const isFound = num < nextExpected; // If already found, make it more transparent
              const isWrong = wrongSquare === num;

              return (
                <motion.button
                  key={index}
                  whileTap={!isFound && isPlaying ? { scale: 0.9 } : {}}
                  onClick={() => handleSquareClick(num)}
                  disabled={isFound || !isPlaying}
                  className={`w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center rounded-xl shadow-md dark:shadow-none border-2 text-2xl sm:text-4xl font-black transition-all duration-200
                    ${isFound 
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-500 border-slate-200 dark:border-slate-700 scale-95 shadow-none' 
                      : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-100 dark:border-slate-600'}
                    ${isWrong 
                      ? '!bg-rose-500 dark:!bg-rose-600 !text-white !border-rose-600 dark:!border-rose-700' 
                      : ''}
                  `}
                >
                  {num}
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2 sm:gap-3 opacity-20">
            {/* Placeholder before game starts */}
            {[...Array(25)].map((_, i) => (
              <div key={i} className="w-14 h-14 sm:w-20 sm:h-20 bg-white dark:bg-slate-700 rounded-xl transition-colors"></div>
            ))}
          </div>
        )}

        {/* WIN/LOSS OVERLAY */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-900/80 dark:bg-black/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center text-white z-10 p-6 text-center transition-colors">
            <h2 className="text-3xl font-black mb-2 animate-bounce text-emerald-400">Excellent!</h2>
            <p className="text-xl">Your time: <span className="font-black text-4xl">{formatTime(timeElapsed)}s</span></p>
          </div>
        )}
      </div>

      {!isPlaying && (
        <button
          onClick={startGame}
          className="px-12 py-4 bg-indigo-600 text-white rounded-full font-black text-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg hover:shadow-indigo-500/30 animate-bounce z-0"
        >
          {isGameOver ? 'PLAY AGAIN' : 'START'}
        </button>
      )}
    </div>
  );
}