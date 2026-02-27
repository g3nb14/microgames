'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

type Phase = 'idle' | 'show' | 'play' | 'success' | 'gameover';

const generatePath = (level: number) => {
  const size = Math.min(3 + Math.floor(level / 4), 5); // Сетка растет от 3x3 до 5x5
  const length = 2 + level;
  const newPath: number[] = [];
  const totalCells = size * size;

  while (newPath.length < length) {
    const cell = Math.floor(Math.random() * totalCells);
    if (!newPath.includes(cell)) newPath.push(cell); // Уникальные клетки
  }
  return { size, path: newPath };
};

export default function PathfinderGame() {
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState<Phase>('idle');
  const [gridSize, setGridSize] = useState(3);
  const [path, setPath] = useState<number[]>([]);
  const [playerPath, setPlayerPath] = useState<number[]>([]);
  const [highScore, setHighScore] = useState(0);
  const [activeCell, setActiveCell] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('pathfinder_highscore');
    if (saved) {
      // eslint-disable-next-line
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  const startLevel = async (currentLevel: number) => {
    setPlayerPath([]);
    const { size, path: newPath } = generatePath(currentLevel);
    setGridSize(size);
    setPath(newPath);
    setPhase('show');

    // Показываем путь по одной клетке
    for (let i = 0; i < newPath.length; i++) {
      await new Promise(res => setTimeout(res, 600));
      setActiveCell(newPath[i]);
      await new Promise(res => setTimeout(res, 400));
      setActiveCell(null);
    }

    setPhase('play');
  };

  const startGame = () => {
    setLevel(1);
    startLevel(1);
  };

  const handleCellClick = (index: number) => {
    if (phase !== 'play') return;

    const currentStep = playerPath.length;

    if (path[currentStep] === index) {
      const newPlayerPath = [...playerPath, index];
      setPlayerPath(newPlayerPath);

      if (newPlayerPath.length === path.length) {
        setPhase('success');
        setTimeout(() => {
          const nextLvl = level + 1;
          setLevel(nextLvl);
          startLevel(nextLvl);
        }, 1000);
      }
    } else {
      setPhase('gameover');
      if (level > highScore) {
        // eslint-disable-next-line
        setHighScore(level);
        localStorage.setItem('pathfinder_highscore', level.toString());
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 p-4 flex flex-col items-center">
      <div className="w-full max-w-xl flex justify-between items-center mb-6 mt-2">
        <Link href="/" className="text-cyan-600 font-bold">← Back to Menu</Link>
        <div className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full font-bold text-sm">
          🏆 Lvl {highScore}
        </div>
      </div>

      <div className="text-center mb-4">
        <h1 className="text-3xl font-black mb-2 text-slate-800 dark:text-slate-100">Pathfinder 🗺️</h1>
        {!phase.includes('gameover') && phase !== 'idle' && <p className="text-slate-500 text-sm">Memorize the sequence, then trace it back!</p>}
      </div>

      {phase !== 'idle' && (
        <div className="mb-6 bg-cyan-100 text-cyan-800 px-6 py-2 rounded-xl font-black text-xl">
          Level: {level}
        </div>
      )}

      {/* GRID */}
      <div className="relative mb-8 p-4 bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
            const isTarget = phase === 'show' && activeCell === idx;
            const isClicked = phase === 'play' && playerPath.includes(idx);
            const isWrong = phase === 'gameover' && playerPath.length > 0 && idx === playerPath[playerPath.length - 1] && path[playerPath.length - 1] !== idx;

            return (
              <motion.button
                key={idx}
                onClick={() => handleCellClick(idx)}
                disabled={phase !== 'play'}
                animate={{ scale: isTarget || isClicked ? 0.95 : 1 }}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl transition-colors duration-200 ${
                  isWrong ? 'bg-rose-500' :
                  isTarget ? 'bg-cyan-500 shadow-lg shadow-cyan-500/50' :
                  isClicked ? 'bg-emerald-400' :
                  'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300'
                }`}
              />
            );
          })}
        </div>

        {phase === 'gameover' && (
          <div className="absolute inset-0 bg-black/90 rounded-3xl flex flex-col items-center justify-center text-white z-10">
            <h2 className="text-3xl font-black text-rose-500 mb-2">Wrong Path!</h2>
            <button onClick={startGame} className="mt-4 px-8 py-3 bg-cyan-500 text-white rounded-full font-bold">
              TRY AGAIN
            </button>
          </div>
        )}

        {phase === 'success' && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <h2 className="text-5xl font-black text-emerald-400 drop-shadow-lg">Perfect!</h2>
          </div>
        )}
      </div>

      {phase === 'idle' && (
        <button onClick={startGame} className="px-12 py-4 bg-cyan-500 text-white rounded-full font-black text-2xl animate-bounce">
          START
        </button>
      )}
    </div>
  );
}