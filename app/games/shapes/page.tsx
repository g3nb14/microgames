'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const SHAPES = [
  { id: 'circle', text: 'circle', draw: (color: string) => <circle cx="50" cy="50" r="45" fill={color} /> },
  { id: 'square', text: 'square', draw: (color: string) => <rect x="10" y="10" width="80" height="80" rx="16" fill={color} /> },
  { id: 'triangle', text: 'triangle', draw: (color: string) => <path d="M50 10 L90 85 L10 85 Z" fill={color} strokeLinejoin="round" /> },
  { id: 'star', text: 'star', draw: (color: string) => <polygon points="50,5 61,35 95,35 67,55 78,90 50,70 22,90 33,55 5,35 39,35" fill={color} strokeLinejoin="round" /> },
  { id: 'rhombus', text: 'rhombus', draw: (color: string) => <polygon points="50,10 90,50 50,90 10,50" fill={color} strokeLinejoin="round" /> },
  { id: 'oval', text: 'oval', draw: (color: string) => <ellipse cx="50" cy="50" rx="45" ry="25" fill={color} /> },
  { id: 'pentagon', text: 'pentagon', draw: (color: string) => <polygon points="50,5 95,38 77,93 23,93 5,38" fill={color} strokeLinejoin="round" /> },
  { id: 'hexagon', text: 'hexagon', draw: (color: string) => <polygon points="50,5 89,27 89,73 50,95 11,73 11,27" fill={color} strokeLinejoin="round" /> },
  { id: 'cross', text: 'cross', draw: (color: string) => <polygon points="35,10 65,10 65,35 90,35 90,65 65,65 65,90 35,90 35,65 10,65 10,35 35,35" fill={color} strokeLinejoin="round" /> },
  { id: 'heart', text: 'heart', draw: (color: string) => <path d="M 50 85 C 10 55, 0 25, 20 10 C 35 0, 50 20, 50 20 C 50 20, 65 0, 80 10 C 100 25, 90 55, 50 85 Z" fill={color} strokeLinejoin="round" /> },

];

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function ShapesGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const [wordData, setWordData] = useState(SHAPES[0]);
  const [shapeData, setShapeData] = useState(SHAPES[0]);
  const [shapeColor, setShapeColor] = useState(COLORS[0]);

  // SMART RANDOM: Prevent long streaks of the same answer
  const streakRef = useRef({ type: false, count: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('shapes_highscore');
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
        localStorage.setItem('shapes_highscore', score.toString());
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, timeLeft]);

  const generateQuestion = () => {
    // eslint-disable-next-line
    let isMatch = Math.random() > 0.5;

    // random interference
    if (streakRef.current.count >= 2) {
      isMatch = !streakRef.current.type;
    }

    // record current streak
    if (streakRef.current.type === isMatch) {
      streakRef.current.count += 1;
    } else {
      streakRef.current.type = isMatch;
      streakRef.current.count = 1;
    }

    // eslint-disable-next-line
    const randomWordIndex = Math.floor(Math.random() * SHAPES.length);
    setWordData(SHAPES[randomWordIndex]);

    // eslint-disable-next-line
    setShapeColor(COLORS[Math.floor(Math.random() * COLORS.length)]);

    if (isMatch) {
      setShapeData(SHAPES[randomWordIndex]);
    } else {
      let randomShapeIndex;
      do {
        // eslint-disable-next-line
        randomShapeIndex = Math.floor(Math.random() * SHAPES.length);
      } while (randomShapeIndex === randomWordIndex);
      setShapeData(SHAPES[randomShapeIndex]);
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setIsGameOver(false);
    streakRef.current = { type: false, count: 0 }; // Reset streak counter on start
    generateQuestion();
  };

  const handleGuess = (userSaysMatch: boolean) => {
    if (!isPlaying) return;

    const isActuallyMatch = wordData.id === shapeData.id;

    if (userSaysMatch === isActuallyMatch) {
      setScore((prev) => prev + 1);
    } else {
      setScore((prev) => prev - 1);
    }

    generateQuestion();
  };

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
        <h1 className="text-3xl sm:text-4xl font-black mb-2 text-slate-800 dark:text-slate-100 transition-colors">Shape Clash 🔺</h1>
        {!isPlaying && !isGameOver && (
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto text-sm transition-colors">
            Does the word match the drawn shape? Color doesn&apos;t matter, don&apos;t let it fool you! You have 30 seconds.
          </p>
        )}
      </div>

      {isPlaying && (
        <div className="flex justify-center items-center gap-8 mb-6">
          <div className="text-slate-500 dark:text-slate-400 font-medium text-xl transition-colors">
            Score: <span className={`font-black text-3xl ml-2 transition-colors ${score < 0 ? 'text-rose-600' : 'text-indigo-600 dark:text-indigo-400'}`}>{score}</span>
          </div>
          <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-6 py-2 rounded-xl font-black text-2xl shadow-sm border-2 border-indigo-200 dark:border-indigo-800/50 transition-colors animate-pulse">
            ⏱ {timeLeft}
          </div>
        </div>
      )}

      {/* SHAPE CARD */}
      <div className="relative w-full max-w-sm h-64 sm:h-72 bg-white dark:bg-slate-900 rounded-3xl shadow-lg dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center mb-8 px-6 overflow-hidden transition-colors duration-300">
        {isPlaying ? (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={wordData.id + shapeData.id + score}
              initial={{ scale: 0.2, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.5, opacity: 0, filter: 'blur(10px)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex flex-col items-center gap-4"
            >
              <svg viewBox="0 0 100 100" className="w-28 h-28 sm:w-36 sm:h-36 drop-shadow-md transition-all duration-200">
                {shapeData.draw(shapeColor)}
              </svg>

              <div className={`font-black uppercase tracking-widest text-3xl sm:text-4xl text-slate-800 dark:text-slate-100 transition-colors drop-shadow-sm select-none`}>
                {wordData.text}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-6xl opacity-20 transition-opacity">🔶</div>
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