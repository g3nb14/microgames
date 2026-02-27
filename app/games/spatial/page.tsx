'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const DIRECTIONS = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
const ARROWS: Record<string, string> = { UP: '⬆️', DOWN: '⬇️', LEFT: '⬅️', RIGHT: '➡️' };
const POSITIONS = ['top-10', 'bottom-10', 'left-10', 'right-10', 'center'];

// Выносим генератор наружу для чистоты линтера
const generateTrap = () => {
  const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
  const position = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
  return { direction, position };
};

export default function SpatialTrapGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const [trap, setTrap] = useState({ direction: 'UP', position: 'center' });

  useEffect(() => {
    const saved = localStorage.getItem('spatial_highscore');
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
        localStorage.setItem('spatial_highscore', score.toString());
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, timeLeft, score, highScore]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setIsGameOver(false);
    setTrap(generateTrap());
  };

  const handleGuess = (guessedDir: string) => {
    if (!isPlaying) return;

    if (guessedDir === trap.direction) {
      setScore((prev) => prev + 1);
    } else {
      setScore((prev) => Math.max(0, prev - 1));
    }
    setTrap(generateTrap());
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 p-4 flex flex-col items-center">
      <div className="w-full max-w-xl flex justify-between items-center mb-6 mt-2">
        <Link href="/" className="text-indigo-600 dark:text-indigo-400 font-bold">← Back to Menu</Link>
        <div className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full font-bold text-sm">
          🏆 High Score: {highScore}
        </div>
      </div>

      <div className="text-center mb-4">
        <h1 className="text-3xl font-black mb-2 text-slate-800 dark:text-slate-100">Spatial Trap 🧭</h1>
        {!isPlaying && !isGameOver && (
          <p className="text-slate-500 text-sm">Click the direction the arrow <strong>POINTS</strong>. Ignore <strong>WHERE</strong> it is!</p>
        )}
      </div>

      {isPlaying && (
        <div className="flex justify-center items-center gap-8 mb-4">
          <div className="text-slate-500 font-medium text-xl">Score: <span className="font-black text-3xl text-rose-500">{score}</span></div>
          <div className="bg-rose-100 text-rose-800 px-6 py-2 rounded-xl font-black text-2xl">⏱ {timeLeft}</div>
        </div>
      )}

      {/* GAME BOARD */}
      <div className="relative w-full max-w-sm h-64 bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-8 overflow-hidden">
        {isPlaying ? (
          <motion.div
            key={score}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`absolute text-7xl drop-shadow-md ${
              trap.position === 'top-10' ? 'top-4' : 
              trap.position === 'bottom-10' ? 'bottom-4' : 
              trap.position === 'left-10' ? 'left-4' : 
              trap.position === 'right-10' ? 'right-4' : ''
            }`}
          >
            {ARROWS[trap.direction]}
          </motion.div>
        ) : (
          <div className="text-5xl opacity-20">🎯</div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white z-10">
            <h2 className="text-3xl font-black text-rose-500">Time&apos;s Up!</h2>
            <p className="text-xl">Score: <span className="text-amber-400 font-black text-4xl">{score}</span></p>
          </div>
        )}
      </div>

      {isPlaying ? (
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {DIRECTIONS.map((dir) => (
            <button
              key={dir}
              onClick={() => handleGuess(dir)}
              className="py-4 bg-slate-800 text-white rounded-2xl font-black text-xl hover:bg-slate-700 active:scale-95 transition-all"
            >
              {dir} {ARROWS[dir]}
            </button>
          ))}
        </div>
      ) : (
        <button onClick={startGame} className="px-12 py-4 bg-rose-500 text-white rounded-full font-black text-2xl animate-bounce">
          {isGameOver ? 'PLAY AGAIN' : 'START'}
        </button>
      )}
    </div>
  );
}