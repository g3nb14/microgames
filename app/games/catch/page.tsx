'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

type Target = {
  index: number;
  isBad: boolean; // true = Бомба, false = Монстр
  emoji: string;
};

export default function CatchGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [target, setTarget] = useState<Target | null>(null);

  // Вычисляем текущий уровень на основе счета
  const level = score < 10 ? 1 : score < 20 ? 2 : 3;
  const gridSize = level === 1 ? 3 : level === 2 ? 4 : 5;
  const cellCount = gridSize * gridSize;

  const gridColsClass = gridSize === 3 ? 'grid-cols-3' : gridSize === 4 ? 'grid-cols-4' : 'grid-cols-5';
  const cellSizeClass = gridSize === 3 ? 'w-20 h-20 sm:w-28 sm:h-28' : gridSize === 4 ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-12 h-12 sm:w-16 sm:h-16';
  const emojiSizeClass = gridSize === 3 ? 'text-5xl sm:text-7xl' : gridSize === 4 ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl';

  useEffect(() => {
    const savedScore = localStorage.getItem('catch_highscore_v3');
    if (savedScore) {
      // eslint-disable-next-line
      setHighScore(parseInt(savedScore));
    }
  }, []);

  // Таймер
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timerId);
    } else if (timeLeft === 0 && isPlaying) {
      // ИГРА ОКОНЧЕНА
      // eslint-disable-next-line
      setIsPlaying(false);
      // eslint-disable-next-line
      setIsGameOver(true);
      // eslint-disable-next-line
      setTarget(null);

      if (score > highScore) {
        // eslint-disable-next-line
        setHighScore(score);
        localStorage.setItem('catch_highscore_v3', score.toString());
        confetti({ particleCount: 300, spread: 120, origin: { y: 0.5 } });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, timeLeft]);

  // Спавн
  useEffect(() => {
    if (!isPlaying) return;

    const currentSpeed = Math.max(400, 900 - score * 25);

    const spawnerId = setInterval(() => {
      setTarget((prev) => {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * cellCount);
        } while (prev && newIndex === prev.index);

        const showBomb = score > 5 && Math.random() < 0.3;
        const emoji = showBomb ? '💣' : '👾';

        return { index: newIndex, isBad: showBomb, emoji };
      });
    }, currentSpeed);

    return () => clearInterval(spawnerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, score, cellCount]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setIsGameOver(false);
    setTarget({ index: Math.floor(Math.random() * 9), isBad: false, emoji: '👾' });
  };

  const whack = (index: number) => {
    if (!isPlaying) return;

    if (target && target.index === index) {
      if (target.isBad) {
        setScore((prev) => prev - 2); // Штраф за бомбу
      } else {
        setScore((prev) => prev + 1); // Плюс за монстра
      }
      setTarget(null);
    } else {
      setScore((prev) => prev - 1); // Штраф за промах
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 p-4 flex flex-col items-center overflow-hidden">
      <div className="w-full max-w-xl flex justify-between items-center mb-4 mt-2">
        <Link href="/" className="text-emerald-600 dark:text-emerald-400 hover:scale-105 transition-transform font-bold">
          ← Back to Menu
        </Link>
        <div className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors px-3 py-1 rounded-full font-bold text-xs sm:text-sm">
          🏆 High Score: {highScore}
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-black mb-2 text-slate-800 dark:text-slate-100 transition-colors">Catch 👾 Avoid 💣</h1>

        {!isPlaying && !isGameOver && (
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto text-sm transition-colors">
            You have 30s. Click monsters (+1), avoid bombs (-2), and don&apos;t miss (-1). Grid grows after 10 points!
          </p>
        )}

        {isPlaying && (
          <div className="flex justify-center items-center gap-6 mt-4">
            <div className="text-slate-500 dark:text-slate-400 transition-colors font-medium text-xl">
              Score: <span className={`font-black text-3xl ml-2 transition-colors ${score < 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>{score}</span>
            </div>
            <div className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-4 py-2 rounded-xl font-black text-xl shadow-sm border-2 border-emerald-200 dark:border-emerald-800/50 transition-colors">
              ⏱ {timeLeft}
            </div>
          </div>
        )}
      </div>

      {/* Level Indicator */}
      {isPlaying && (
        <div className="mb-4 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-4 py-1 rounded-full font-bold text-sm animate-pulse transition-colors">
          Level {level} (Grid {gridSize}x{gridSize})
        </div>
      )}

      {/* GAME BOARD */}
      <div className="relative">
        <div className={`grid ${gridColsClass} gap-2 sm:gap-3 bg-slate-200 dark:bg-slate-800 p-2 sm:p-4 rounded-3xl shadow-inner transition-all duration-500 ease-in-out`}>
          {[...Array(cellCount)].map((_, index) => (
            <div
              key={index}
              onPointerDown={() => whack(index)}
              className={`${cellSizeClass} bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-none border border-transparent dark:border-slate-800 flex items-center justify-center cursor-pointer overflow-hidden relative transition-all duration-300 active:bg-slate-100 dark:active:bg-slate-800 ${!isPlaying && 'opacity-50 pointer-events-none'}`}
            >
              <AnimatePresence>
                {target?.index === index && isPlaying && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0, transition: { duration: 0.1 } }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`${emojiSizeClass} drop-shadow-md select-none`}
                  >
                    {target.emoji}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* GAME OVER OVERLAY */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center text-white p-6 z-10 text-center">
            <h2 className="text-4xl font-black mb-2 text-emerald-400">Time&apos;s Up!</h2>
            <p className="text-xl mb-6">Your score: <span className="font-bold text-3xl text-white">{score}</span></p>
            {score > highScore && score > 0 && (
              <p className="text-amber-400 font-bold mb-6 animate-bounce text-lg">🌟 NEW HIGH SCORE! 🌟</p>
            )}
            <button
              onClick={startGame}
              className="px-8 py-3 bg-emerald-500 text-white rounded-full font-black text-lg hover:bg-emerald-600 active:scale-95 transition-all shadow-lg"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Start Button */}
      {!isPlaying && !isGameOver && (
        <button
          onClick={startGame}
          className="mt-8 px-12 py-4 bg-emerald-500 text-white rounded-full font-black text-2xl hover:bg-emerald-600 active:scale-95 transition-all shadow-lg hover:shadow-emerald-500/30 animate-bounce"
        >
          START
        </button>
      )}
    </div>
  );
}