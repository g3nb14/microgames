'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// Перевели цвета на английский
const COLORS = [
  { text: 'RED', hex: '#ef4444', colorClass: 'text-red-500' },
  { text: 'BLUE', hex: '#3b82f6', colorClass: 'text-blue-500' },
  { text: 'GREEN', hex: '#10b981', colorClass: 'text-emerald-500' },
  { text: 'YELLOW', hex: '#f59e0b', colorClass: 'text-amber-500' },
  { text: 'PURPLE', hex: '#8b5cf6', colorClass: 'text-purple-500' },
];

export default function ColorsGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const [wordData, setWordData] = useState(COLORS[0]);
  const [colorData, setColorData] = useState(COLORS[0]);

  // УМНЫЙ РАНДОМ: Следим за сериями ответов
  const streakRef = useRef({ type: false, count: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('colors_highscore_v3'); // Обновил ключ, так как поменяли язык
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
        localStorage.setItem('colors_highscore_v3', score.toString());
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, timeLeft]);

  const generateQuestion = () => {
    // eslint-disable-next-line
    let isMatch = Math.random() > 0.5;

    // ВМЕШИВАЕМСЯ В РАНДОМ: прерываем серию больше 2
    if (streakRef.current.count >= 2) {
      isMatch = !streakRef.current.type;
    }

    // Записываем в историю
    if (streakRef.current.type === isMatch) {
      streakRef.current.count += 1;
    } else {
      streakRef.current.type = isMatch;
      streakRef.current.count = 1;
    }

    // eslint-disable-next-line
    const randomWordIndex = Math.floor(Math.random() * COLORS.length);
    setWordData(COLORS[randomWordIndex]);

    if (isMatch) {
      setColorData(COLORS[randomWordIndex]);
    } else {
      let randomColorIndex;
      do {
        // eslint-disable-next-line
        randomColorIndex = Math.floor(Math.random() * COLORS.length);
      } while (randomColorIndex === randomWordIndex);
      setColorData(COLORS[randomColorIndex]);
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setIsGameOver(false);
    streakRef.current = { type: false, count: 0 };
    generateQuestion();
  };

  const handleGuess = (userSaysMatch: boolean) => {
    if (!isPlaying) return;

    const isActuallyMatch = wordData.text === colorData.text;

    if (userSaysMatch === isActuallyMatch) {
      setScore((prev) => prev + 1);
    } else {
      setScore((prev) => prev - 1);
    }

    generateQuestion();
  };

  const wordLength = wordData.text.length;
  const dynamicFontSizeClass = wordLength > 9
    ? 'text-4xl sm:text-5xl'
    : wordLength > 7
    ? 'text-5xl sm:text-6xl'
    : 'text-6xl sm:text-7xl';

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
        <h1 className="text-3xl sm:text-4xl font-black mb-2 text-slate-800 dark:text-slate-100 transition-colors">Color Clash 🌈</h1>
        {!isPlaying && !isGameOver && (
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto text-sm transition-colors">
            Does the word match the color it&apos;s written in? Don&apos;t let your brain trick you! You have 30 seconds.
          </p>
        )}
      </div>

      {isPlaying && (
        <div className="flex justify-center items-center gap-8 mb-8">
          <div className="text-slate-500 dark:text-slate-400 transition-colors font-medium text-xl">
            Score: <span className={`font-black text-3xl ml-2 transition-colors ${score < 0 ? 'text-rose-600' : 'text-indigo-600 dark:text-indigo-400'}`}>{score}</span>
          </div>
          <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-6 py-2 rounded-xl font-black text-2xl shadow-sm border-2 border-indigo-200 dark:border-indigo-800/50 transition-colors animate-pulse">
            ⏱ {timeLeft}
          </div>
        </div>
      )}

      <div className="relative w-full max-w-lg h-40 sm:h-52 bg-white dark:bg-slate-900 rounded-3xl shadow-lg dark:shadow-none border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-8 px-6 overflow-hidden transition-all duration-300">
        {isPlaying ? (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={wordData.text + colorData.text + score}
              initial={{ scale: 0.5, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 22 }}
              className={`font-black uppercase select-none drop-shadow-sm transition-all duration-100
                ${dynamicFontSizeClass} 
                ${colorData.colorClass} 
                ${wordLength > 7 ? 'tracking-wide' : 'tracking-widest'}
              `}
            >
              {wordData.text}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-6xl opacity-20">🧠</div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10 p-6 rounded-3xl text-center">
            <h2 className="text-3xl sm:text-4xl font-black mb-2 animate-pulse text-indigo-300">Time&apos;s Up!</h2>
            <p className="text-xl">Your score: <span className="text-amber-400 font-black text-4xl">{score}</span></p>
          </div>
        )}
      </div>

      {isPlaying ? (
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
          <button
            onClick={() => handleGuess(false)}
            className="flex-1 py-4 sm:py-5 bg-rose-500 text-white rounded-2xl font-black text-lg sm:text-xl hover:bg-rose-600 active:scale-95 transition-all shadow-lg hover:shadow-rose-500/30"
          >
            ❌ NO MATCH
          </button>
          <button
            onClick={() => handleGuess(true)}
            className="flex-1 py-4 sm:py-5 bg-emerald-500 text-white rounded-2xl font-black text-lg sm:text-xl hover:bg-emerald-600 active:scale-95 transition-all shadow-lg hover:shadow-emerald-500/30"
          >
            MATCH ✅
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