'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const SYMBOLS = ['🍎', '🍉', '🍇', '🍌', '🍓', '🍒', '🥝', '🍋'];

export default function NBackGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45); // 45 seconds for this intense game
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  // The history of shown symbols
  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('nback_highscore');
    if (saved) {
      // eslint-disable-next-line
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timerId);
    } else if (timeLeft === 0 && isPlaying) {
      // eslint-disable-next-line
      setIsPlaying(false);
      // eslint-disable-next-line
      setIsGameOver(true);
      if (score > highScore) {
        // eslint-disable-next-line
        setHighScore(score);
        localStorage.setItem('nback_highscore', score.toString());
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, timeLeft, score, highScore]);

  const generateNextTurn = (currentHist: string[]) => {
    // 30% chance to force a match (2-back)
    const forceMatch = Math.random() > 0.7;
    let nextSymbol = '';

    if (forceMatch && currentHist.length >= 2) {
      nextSymbol = currentHist[currentHist.length - 2]; // Match the one 2 steps back
    } else {
      // Pick random
      do {
        nextSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      } while (forceMatch && nextSymbol === currentHist[currentHist.length - 2]);
    }

    const newHist = [...currentHist, nextSymbol];
    setHistory(newHist);
    setCurrentIndex(newHist.length - 1);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(45);
    setIsPlaying(true);
    setIsGameOver(false);

    // Pre-fill the first 2 symbols so we can immediately start asking "2-back"
    const startHistory = [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    ];

    generateNextTurn(startHistory);
  };

  const handleGuess = (userSaysMatch: boolean) => {
    if (!isPlaying) return;

    const twoStepsBack = history[currentIndex - 2];
    const currentSymbol = history[currentIndex];
    const isActuallyMatch = currentSymbol === twoStepsBack;

    if (userSaysMatch === isActuallyMatch) {
      setScore((prev) => prev + 1);
    } else {
      setScore((prev) => Math.max(0, prev - 1)); // No negative scores here, it's too hard!
    }

    generateNextTurn(history);
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
        <h1 className="text-3xl sm:text-4xl font-black mb-2 text-slate-800 dark:text-slate-100 transition-colors">N-Back (2-Back) 🧠</h1>
        {!isPlaying && !isGameOver && (
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto text-sm transition-colors">
            Does the current symbol match the one shown <strong>TWO steps ago</strong>? This is the ultimate working memory test.
          </p>
        )}
      </div>

      {isPlaying && (
        <div className="flex justify-center items-center gap-8 mb-6">
          <div className="text-slate-500 dark:text-slate-400 font-medium text-xl transition-colors">
            Score: <span className="font-black text-3xl ml-2 text-indigo-600 dark:text-indigo-400 transition-colors">{score}</span>
          </div>
          <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-6 py-2 rounded-xl font-black text-2xl shadow-sm border-2 border-indigo-200 dark:border-indigo-800/50 transition-colors animate-pulse">
            ⏱ {timeLeft}
          </div>
        </div>
      )}

      {/* GAME BOARD */}
      <div className="relative w-full max-w-sm h-64 sm:h-72 bg-white dark:bg-slate-900 rounded-3xl shadow-lg dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center mb-8 px-6 overflow-hidden transition-colors duration-300">
        {isPlaying ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.5, opacity: 0, x: 50 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.8, opacity: 0, x: -50 }}
              transition={{ duration: 0.2 }}
              className="text-8xl sm:text-9xl drop-shadow-md select-none"
            >
              {history[currentIndex]}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-6xl opacity-20 transition-opacity">🔄</div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-900/95 dark:bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10 p-6 text-center transition-colors">
            <h2 className="text-3xl sm:text-4xl font-black mb-2 animate-pulse text-indigo-300">Time&apos;s Up!</h2>
            <p className="text-xl">Your score: <span className="text-amber-400 font-black text-4xl">{score}</span></p>
          </div>
        )}
      </div>

      {isPlaying ? (
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <button
            onClick={() => handleGuess(false)}
            className="flex-1 py-4 sm:py-5 bg-rose-500 text-white rounded-2xl font-black text-lg hover:bg-rose-600 active:scale-95 transition-all shadow-lg hover:shadow-rose-500/30"
          >
            ❌ NO MATCH
          </button>
          <button
            onClick={() => handleGuess(true)}
            className="flex-1 py-4 sm:py-5 bg-emerald-500 text-white rounded-2xl font-black text-lg hover:bg-emerald-600 active:scale-95 transition-all shadow-lg hover:shadow-emerald-500/30"
          >
            MATCH ✅
          </button>
        </div>
      ) : (
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