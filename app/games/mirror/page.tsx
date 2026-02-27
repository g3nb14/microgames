'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

const generatePattern = (size: number) => {
  const newPattern = Array(size * size).fill(false);
  // Закрашиваем примерно 40% клеток случайным образом
  const cellsToFill = Math.floor((size * size) * 0.4);
  let filled = 0;
  while (filled < cellsToFill) {
    const idx = Math.floor(Math.random() * (size * size));
    if (!newPattern[idx]) {
      newPattern[idx] = true;
      filled++;
    }
  }
  return newPattern;
};


const getMirroredIndex = (index: number, size: number) => {
  const row = Math.floor(index / size);
  const col = index % size;
  const mirroredCol = size - 1 - col;
  return row * size + mirroredCol;
};

export default function MirrorGame() {
  const [level, setLevel] = useState(1);
  const [gridSize, setGridSize] = useState(3);
  const [leftPattern, setLeftPattern] = useState<boolean[]>([]);
  const [rightPattern, setRightPattern] = useState<boolean[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('mirror_highscore');
    if (saved) {
      // eslint-disable-next-line
      setHighScore(parseInt(saved, 10));
    }
    startLevel(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startLevel = (lvl: number) => {
    const size = Math.min(3 + Math.floor((lvl - 1) / 3), 5); // 3x3, потом 4x4, макс 5x5
    setGridSize(size);
    setLeftPattern(generatePattern(size));
    setRightPattern(Array(size * size).fill(false));
    setIsSuccess(false);
  };

  const handleCellClick = (index: number) => {
    if (isSuccess) return;

    const newRight = [...rightPattern];
    newRight[index] = !newRight[index]; // Переключаем цвет клетки
    setRightPattern(newRight);


    let match = true;
    for (let i = 0; i < newRight.length; i++) {
      const mirroredLeftIndex = getMirroredIndex(i, gridSize);
      if (newRight[i] !== leftPattern[mirroredLeftIndex]) {
        match = false;
        break;
      }
    }

    if (match) {
      setIsSuccess(true);
      if (level >= highScore) {
        setHighScore(level);
        localStorage.setItem('mirror_highscore', level.toString());
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      }
      setTimeout(() => {
        setLevel((prev) => prev + 1);
        startLevel(level + 1);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 p-4 flex flex-col items-center">
      <div className="w-full max-w-xl flex justify-between items-center mb-6 mt-2">
        <Link href="/" className="text-blue-600 font-bold">← Back to Menu</Link>
        <div className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full font-bold text-sm">
          🏆 Lvl {highScore}
        </div>
      </div>

      <div className="text-center mb-4">
        <h1 className="text-3xl font-black mb-2 text-slate-800 dark:text-slate-100">Mirror Matrix 🪞</h1>
        <p className="text-slate-500 text-sm">Draw the exact mirrored reflection on the right side.</p>
      </div>

      <div className="mb-6 bg-blue-100 text-blue-800 px-6 py-2 rounded-xl font-black text-xl">
        Level: {level}
      </div>

      <div className="flex gap-2 sm:gap-6 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        {/* left matrix  */}
        <div
          className="grid gap-1 sm:gap-2"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {leftPattern.map((isFilled, idx) => (
            <div
              key={`left-${idx}`}
              className={`w-10 h-10 sm:w-14 sm:h-14 rounded-md transition-colors ${
                isFilled ? 'bg-slate-800 dark:bg-slate-200' : 'bg-slate-100 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* separator */}
        <div className="w-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-1"></div>

        {/* Right matrix (player draws here */}
        <div
          className="grid gap-1 sm:gap-2"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {rightPattern.map((isFilled, idx) => (
            <button
              key={`right-${idx}`}
              onClick={() => handleCellClick(idx)}
              className={`w-10 h-10 sm:w-14 sm:h-14 rounded-md transition-all active:scale-90 ${
                isFilled ? 'bg-blue-500 shadow-inner' : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300'
              }`}
            />
          ))}
        </div>

        {isSuccess && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-10">
            <h2 className="text-4xl font-black text-blue-500 animate-bounce drop-shadow-md">Perfect! 🪞</h2>
          </div>
        )}
      </div>

      <button
        onClick={() => startLevel(1)}
        className="mt-6 text-slate-400 hover:text-slate-600 font-bold text-sm"
      >
        Restart Game
      </button>
    </div>
  );
}