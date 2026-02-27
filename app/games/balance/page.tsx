'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const WEIGHTS = [1, 5, 10, 25, 50];

const generateTarget = () => Math.floor(Math.random() * 80) + 20; // 20 - 100

export default function BalanceGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const [targetWeight, setTargetWeight] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('balance_highscore');
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
        localStorage.setItem('balance_highscore', score.toString());
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, timeLeft, score, highScore]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(45);
    setIsPlaying(true);
    setIsGameOver(false);
    setTargetWeight(generateTarget());
    setCurrentWeight(0);
  };

  const addWeight = (w: number) => {
    if (!isPlaying) return;
    const newWeight = currentWeight + w;
    setCurrentWeight(newWeight);

    if (newWeight === targetWeight) {
      setScore((prev) => prev + 1);
      setTimeout(() => {
        setTargetWeight(generateTarget());
        setCurrentWeight(0);
      }, 300);
    } else if (newWeight > targetWeight) {
      // Перебор! Сбрасываем текущий вес
      setCurrentWeight(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 p-4 flex flex-col items-center">
      <div className="w-full max-w-xl flex justify-between items-center mb-6 mt-2">
        <Link href="/" className="text-amber-600 font-bold">← Back to Menu</Link>
        <div className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full font-bold text-sm">
          🏆 High Score: {highScore}
        </div>
      </div>

      <div className="text-center mb-4">
        <h1 className="text-3xl font-black mb-2 text-slate-800 dark:text-slate-100">Perfect Balance ⚖️</h1>
        {!isPlaying && !isGameOver && <p className="text-slate-500 text-sm">Add weights to match the exact target. Over 100? It resets!</p>}
      </div>

      {isPlaying && (
        <div className="flex justify-center items-center gap-8 mb-4">
          <div className="text-slate-500 font-medium text-xl">Score: <span className="font-black text-3xl text-amber-500">{score}</span></div>
          <div className="bg-amber-100 text-amber-800 px-6 py-2 rounded-xl font-black text-2xl">⏱ {timeLeft}</div>
        </div>
      )}

      {/* BALANCE SCALES */}
      <div className="relative w-full max-w-sm h-48 bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 flex items-center justify-around mb-8 overflow-hidden px-4">
        {isPlaying ? (
          <>
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-slate-400 mb-2">TARGET</span>
              <motion.div className="w-24 h-24 bg-slate-800 text-white rounded-full flex items-center justify-center text-4xl font-black shadow-inner">
                {targetWeight}
              </motion.div>
            </div>
            <div className="text-3xl font-black text-slate-300">=</div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-slate-400 mb-2">CURRENT</span>
              <motion.div
                key={currentWeight}
                animate={{ scale: [1, 1.1, 1] }}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black shadow-lg border-4 ${
                  currentWeight === targetWeight ? 'bg-emerald-500 border-emerald-400 text-white' : 
                  currentWeight > targetWeight ? 'bg-rose-500 border-rose-400 text-white' : 
                  'bg-amber-400 border-amber-300 text-slate-900'
                }`}
              >
                {currentWeight}
              </motion.div>
            </div>
          </>
        ) : (
          <div className="text-6xl opacity-20">⚖️</div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white z-10">
            <h2 className="text-3xl font-black text-amber-500">Time&apos;s Up!</h2>
            <p className="text-xl">Score: <span className="text-white font-black text-4xl">{score}</span></p>
          </div>
        )}
      </div>

      {isPlaying ? (
        <div className="grid grid-cols-5 gap-2 w-full max-w-sm">
          {WEIGHTS.map((w) => (
            <button
              key={w}
              onClick={() => addWeight(w)}
              className="py-4 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-black text-xl hover:bg-amber-400 active:scale-95 transition-all shadow-sm"
            >
              +{w}
            </button>
          ))}
          <button
            onClick={() => setCurrentWeight(0)}
            className="col-span-5 mt-2 py-3 bg-rose-100 text-rose-600 rounded-xl font-bold active:scale-95"
          >
            Reset Current Weight
          </button>
        </div>
      ) : (
        <button onClick={startGame} className="px-12 py-4 bg-amber-500 text-white rounded-full font-black text-2xl animate-bounce">
          {isGameOver ? 'PLAY AGAIN' : 'START'}
        </button>
      )}
    </div>
  );
}