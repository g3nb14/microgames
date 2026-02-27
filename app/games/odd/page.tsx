'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// Pairs of emojis/symbols. They get harder and more visually similar!
const EMOJI_PAIRS = [
  // 🟢 Easy
  ['🍎', '🍅'], ['😀', '😃'], ['🌞', '🌝'], ['🚗', '🚕'],
  ['🦊', '🐱'], ['💙', '💜'], ['🌲', '🌳'], ['🥞', '🧇'],

  // 🟡 Medium
  ['🐻', '🐼'], ['⏳', '⌛'], ['🌍', '🌎'], ['🔒', '🔓'],
  ['🐾', '👣'], ['📱', '📲'], ['🍵', '☕'], ['🍂', '🍁'],
  ['🏡', '🏠'], ['🚆', '🚄'], ['🍧', '🍨'], ['🐪', '🐫'],

  // 🔴 Hard
  ['🙂', '🙃'], ['🤧', '😪'], ['🥵', '😡'], ['🥺', '🥹'],
  ['📈', '📉'], ['🍙', '🍘'], ['🌔', '🌖'], ['⛄', '☃️'],
  ['🧡', '❤️'], ['📝', '🗒️'], ['💿', '📀'], ['🕰️', '⏱️']
];

export default function OddOneOutGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // Grid state
  const [gridItems, setGridItems] = useState<string[]>([]);
  const [oddIndex, setOddIndex] = useState<number>(0);
  const [gridSize, setGridSize] = useState<number>(3); // Starts at 3x3

  // Load high score on mount
  useEffect(() => {
    const saved = localStorage.getItem('odd_highscore');
    if (saved) {
      // eslint-disable-next-line
      setHighScore(parseInt(saved));
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timerId);
    } else if (timeLeft === 0 && isPlaying) {
      // Game Over!
      // eslint-disable-next-line
      setIsPlaying(false);
      // eslint-disable-next-line
      setIsGameOver(true);

      if (score > highScore) {
        // eslint-disable-next-line
        setHighScore(score);
        localStorage.setItem('odd_highscore', score.toString());
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, timeLeft]);

  // Generate a new grid
  const generateGrid = (currentScore: number) => {
    // Increase grid size dynamically based on score (Max 7x7)
    const newSize = Math.min(7, 3 + Math.floor(currentScore / 5));
    const totalCells = newSize * newSize;

    // Pick a random pair
    // eslint-disable-next-line
    const pairIndex = Math.floor(Math.random() * EMOJI_PAIRS.length);
    const [majority, minority] = EMOJI_PAIRS[pairIndex];

    // Randomize which one is the odd one out (50% chance to swap)
    // eslint-disable-next-line
    const isSwapped = Math.random() > 0.5;
    const mainSymbol = isSwapped ? minority : majority;
    const oddSymbol = isSwapped ? majority : minority;

    // Pick random position for the odd one
    // eslint-disable-next-line
    const targetIndex = Math.floor(Math.random() * totalCells);

    // Fill the grid
    const newGrid = Array(totalCells).fill(mainSymbol);
    newGrid[targetIndex] = oddSymbol;

    setGridSize(newSize);
    setGridItems(newGrid);
    setOddIndex(targetIndex);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setIsGameOver(false);
    generateGrid(0);
  };

  const handleItemClick = (index: number) => {
    if (!isPlaying) return;

    if (index === oddIndex) {
      // Correct!
      const newScore = score + 1;
      setScore(newScore);
      generateGrid(newScore);
    } else {
      // Wrong! Penalty
      setScore((prev) => prev - 1);
    }
  };

  // Dynamic grid column classes for Tailwind
  const gridColsClass = {
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
  }[gridSize] || 'grid-cols-3';

  // Make items smaller as grid grows
  const itemSizeClass = gridSize > 5
    ? 'text-2xl sm:text-3xl p-2'
    : gridSize > 4
    ? 'text-3xl sm:text-4xl p-3'
    : 'text-4xl sm:text-5xl p-4';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 p-4 flex flex-col items-center overflow-x-hidden relative">
      <div className="w-full max-w-xl flex justify-between items-center mb-6 mt-2">
        <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform font-bold">
          ← Back to Menu
        </Link>
        <div className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors px-3 py-1 rounded-full font-bold text-xs sm:text-sm">
          🏆 High Score: {highScore}
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-black mb-2 text-slate-800 dark:text-slate-100 transition-colors">Odd One Out 🕵️‍♂️</h1>
        {!isPlaying && !isGameOver && (
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto text-sm transition-colors">
            Find the symbol that is different from the rest! Grid grows as you score. You have 30 seconds.
          </p>
        )}
      </div>

      {isPlaying && (
        <div className="flex justify-center items-center gap-8 mb-6">
          <div className="text-slate-500 dark:text-slate-400 font-medium text-xl transition-colors">
            Score: <span className={`font-black text-3xl ml-2 transition-colors ${score < 0 ? 'text-rose-600 dark:text-rose-500' : 'text-indigo-600 dark:text-indigo-400'}`}>{score}</span>
          </div>
          <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-6 py-2 rounded-xl font-black text-2xl shadow-sm border-2 border-indigo-200 dark:border-indigo-800/50 transition-colors animate-pulse">
            ⏱ {timeLeft}
          </div>
        </div>
      )}

      {/* GAME BOARD */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-lg dark:shadow-none border border-slate-100 dark:border-slate-800 p-4 mb-8 transition-colors duration-300">
        {isPlaying ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={score} // Re-animate on score change
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.15 }}
              className={`grid ${gridColsClass} gap-1 sm:gap-2 place-items-center`}
            >
              {gridItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleItemClick(index)}
                  className={`flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all ${itemSizeClass} w-full aspect-square`}
                >
                  {item}
                </button>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="h-64 flex items-center justify-center text-6xl opacity-20 transition-opacity">
            👀
          </div>
        )}

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-900/95 dark:bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10 p-6 rounded-3xl text-center">
            <h2 className="text-3xl sm:text-4xl font-black mb-2 animate-pulse text-indigo-300">Time&apos;s Up!</h2>
            <p className="text-xl">Your score: <span className="text-amber-400 font-black text-4xl">{score}</span></p>
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