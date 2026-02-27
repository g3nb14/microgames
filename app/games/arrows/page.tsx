'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

type Direction = 'LEFT' | 'RIGHT';

type ArrowData = {
  center: Direction;
  distractors: Direction;
  id: number;
};

export default function ArrowsGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const [arrowData, setArrowData] = useState<ArrowData | null>(null);
  const [gameCount, setGameCount] = useState(0);

  const streakRef = useRef({ direction: 'LEFT' as Direction, count: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('arrows_highscore');
    if (saved) {
      // eslint-disable-next-line
      setHighScore(parseInt(saved));
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
        localStorage.setItem('arrows_highscore', score.toString());
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, timeLeft]);

  const generateArrows = () => {
    // eslint-disable-next-line
    let targetDir: Direction = Math.random() > 0.5 ? 'LEFT' : 'RIGHT';

    if (streakRef.current.count >= 2) {
      targetDir = streakRef.current.direction === 'LEFT' ? 'RIGHT' : 'LEFT';
    }

    if (streakRef.current.direction === targetDir) {
      streakRef.current.count += 1;
    } else {
      streakRef.current.direction = targetDir;
      streakRef.current.count = 1;
    }

    // eslint-disable-next-line
    const isCongruent = Math.random() > 0.5;
    const distractorDir: Direction = isCongruent ? targetDir : (targetDir === 'LEFT' ? 'RIGHT' : 'LEFT');

    setGameCount(prev => prev + 1);
    setArrowData({
      center: targetDir,
      distractors: distractorDir,
      id: gameCount
    });
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setIsGameOver(false);
    streakRef.current = { direction: 'LEFT', count: 0 };
    generateArrows();
  };

  const handleGuess = (guessedDir: Direction) => {
    if (!isPlaying || !arrowData) return;

    if (guessedDir === arrowData.center) {
      setScore((prev) => prev + 1);
    } else {
      setScore((prev) => prev - 1);
    }

    generateArrows();
  };

  const renderArrow = (dir: Direction) => dir === 'LEFT' ? '◀' : '▶';

  // --- ДИНАМИЧЕСКАЯ СЛОЖНОСТЬ ---
  const currentLevel = Math.floor(Math.max(0, score) / 10) + 1;

  // На 1 уровне центр синий. На 2 и 3 — всё сливается.
  const centerColor = currentLevel >= 2 ? 'text-slate-800 dark:text-slate-100' : 'text-indigo-600 dark:text-indigo-400';
  const centerScale = currentLevel >= 2 ? 'scale-100' : 'scale-110 font-black';

  // Боковые стрелки постепенно темнеют, пока не станут такими же, как центр
  const distractorColor = currentLevel >= 3
    ? 'text-slate-800 dark:text-slate-100'
    : (currentLevel === 2 ? 'text-slate-500 dark:text-slate-500' : 'text-slate-300 dark:text-slate-700');

  // Расстояние между стрелками сужается
  const gapClass = currentLevel >= 3 ? 'gap-0 sm:gap-1' : 'gap-2 sm:gap-4';

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
        <h1 className="text-3xl sm:text-4xl font-black mb-2 text-slate-800 dark:text-slate-100 transition-colors">Arrow Dash ⬅️</h1>
        {!isPlaying && !isGameOver && (
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto text-sm transition-colors">
            Focus ONLY on the center arrow. Ignore the crowd. <br/>
            <span className="text-rose-500 font-bold">Warning: Visual aids disappear as you score!</span>
          </p>
        )}
      </div>

      {isPlaying && (
        <div className="flex justify-center items-center gap-8 mb-6">
          <div className="text-slate-500 dark:text-slate-400 transition-colors font-medium text-xl">
            Score: <span className={`font-black text-3xl ml-2 transition-colors ${score < 0 ? 'text-rose-600' : 'text-indigo-600 dark:text-indigo-400'}`}>{score}</span>
          </div>
          <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-6 py-2 rounded-xl font-black text-2xl shadow-sm border-2 border-indigo-200 dark:border-indigo-800/50 transition-colors animate-pulse">
            ⏱ {timeLeft}
          </div>
        </div>
      )}

      {/* Индикатор уровня хардкора */}
      {isPlaying && currentLevel > 1 && (
        <div className="mb-4 text-rose-500 font-bold text-sm uppercase tracking-widest animate-pulse">
          {currentLevel === 2 ? 'Level 2: Camouflage' : 'Level 3: Pure Chaos 🔥'}
        </div>
      )}

      {/* GAME BOARD */}
      <div className="relative w-full max-w-lg h-40 sm:h-52 bg-white dark:bg-slate-900 rounded-3xl shadow-lg dark:shadow-none border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-8 px-4 overflow-hidden transition-all duration-300">
        {isPlaying && arrowData ? (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={arrowData.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className={`flex ${gapClass} text-5xl sm:text-7xl drop-shadow-sm transition-all duration-300`}
            >
              <span className={`${distractorColor} transition-colors duration-300`}>{renderArrow(arrowData.distractors)}</span>
              <span className={`${distractorColor} transition-colors duration-300`}>{renderArrow(arrowData.distractors)}</span>
              <span className={`${centerColor} ${centerScale} transition-all duration-300`}>{renderArrow(arrowData.center)}</span>
              <span className={`${distractorColor} transition-colors duration-300`}>{renderArrow(arrowData.distractors)}</span>
              <span className={`${distractorColor} transition-colors duration-300`}>{renderArrow(arrowData.distractors)}</span>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-6xl opacity-20 flex gap-4 transition-colors">
            <span className="text-slate-300 dark:text-slate-600">◀</span>
            <span className="text-slate-300 dark:text-slate-600">◀</span>
            <span className="text-slate-800 dark:text-slate-100">▶</span>
            <span className="text-slate-300 dark:text-slate-600">◀</span>
            <span className="text-slate-300 dark:text-slate-600">◀</span>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10 p-6 rounded-3xl text-center">
            <h2 className="text-3xl sm:text-4xl font-black mb-2 animate-pulse text-indigo-300">Time&apos;s Up!</h2>
            <p className="text-xl">Your score: <span className="text-amber-400 font-black text-4xl">{score}</span></p>
          </div>
        )}
      </div>

      {/* CONTROLS */}
      {isPlaying ? (
        <div className="flex gap-3 w-full max-w-lg">
          <button
            onClick={() => handleGuess('LEFT')}
            className="flex-1 py-6 bg-slate-800 text-white rounded-2xl font-black text-3xl hover:bg-slate-700 active:scale-95 transition-all shadow-lg hover:shadow-slate-800/30 touch-manipulation"
          >
            ◀ LEFT
          </button>
          <button
            onClick={() => handleGuess('RIGHT')}
            className="flex-1 py-6 bg-slate-800 text-white rounded-2xl font-black text-3xl hover:bg-slate-700 active:scale-95 transition-all shadow-lg hover:shadow-slate-800/30 touch-manipulation"
          >
            RIGHT ▶
          </button>
        </div>
      ) : (
        <button
          onClick={startGame}
          className="mt-4 px-12 py-4 bg-indigo-600 text-white rounded-full font-black text-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg hover:shadow-indigo-500/30 animate-bounce z-0"
        >
          {isGameOver ? 'PLAY AGAIN' : 'START'}
        </button>
      )}
    </div>
  );
}