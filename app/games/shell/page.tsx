'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

type Phase = 'idle' | 'show' | 'shuffle' | 'guess' | 'result';

interface Shell {
  id: number;
  hasTreasure: boolean;
}

// Helper to shuffle arrays
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// Initialize 8 shells, 3 with treasures
const generateInitialShells = (): Shell[] => {
  const arr = Array.from({ length: 8 }, (_, i) => ({ id: i, hasTreasure: i < 3 }));
  return shuffleArray(arr);
};

export default function ShellGame() {
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [shells, setShells] = useState<Shell[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const shuffleInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('shell_highscore');
    if (saved) {
      // eslint-disable-next-line
      setHighScore(parseInt(saved, 10));
    }
    return () => stopShuffling();
  }, []);

  const stopShuffling = () => {
    if (shuffleInterval.current) clearInterval(shuffleInterval.current);
  };

  const startLevel = (currentLevel: number) => {
    setPhase('show');
    setSelectedIds([]);
    setShells(generateInitialShells());

    // Phase 1: Show treasures for 2 seconds
    setTimeout(() => {
      setPhase('shuffle');

      // Phase 2: Start rapid shuffling
      // Shuffle faster and longer on higher levels
      const speedMs = Math.max(200, 600 - (currentLevel * 30));
      const durationMs = Math.min(6000, 3000 + (currentLevel * 500));

      shuffleInterval.current = setInterval(() => {
        setShells((prev) => shuffleArray(prev));
      }, speedMs);

      // Phase 3: Stop shuffling and let player guess
      setTimeout(() => {
        stopShuffling();
        setPhase('guess');
      }, durationMs);

    }, 2000);
  };

  const startGame = () => {
    setLevel(1);
    startLevel(1);
  };

  const handleSelect = (id: number) => {
    if (phase !== 'guess') return;

    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id];

    setSelectedIds(newSelected);

    // If player picked 3 boxes, evaluate result
    if (newSelected.length === 3) {
      setPhase('result');

      // Check if all selected shells actually have treasures
      const correctCount = shells.filter(s => newSelected.includes(s.id) && s.hasTreasure).length;

      if (correctCount === 3) {
        // WIN!
        if (level >= highScore) {
          // eslint-disable-next-line
          setHighScore(level);
          localStorage.setItem('shell_highscore', level.toString());
        }
        setTimeout(() => {
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
          const nextLevel = level + 1;
          setLevel(nextLevel);
          startLevel(nextLevel);
        }, 1500);
      } else {
        // LOSE!
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl flex justify-between items-center mb-6 mt-2">
        <Link href="/" className="text-amber-600 font-bold">← Back to Menu</Link>
        <div className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full font-bold text-sm">
          🏆 Lvl {highScore}
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-black mb-2 text-slate-800 dark:text-slate-100">Shell Game 🎩</h1>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Keep your eyes on the treasures. Do not lose them when the boxes shuffle!
        </p>
      </div>

      {phase !== 'idle' && (
        <div className="mb-8 flex flex-col items-center">
          <div className="text-2xl font-black text-amber-500 mb-2">Level {level}</div>
          <div className="h-6 text-slate-500 font-bold tracking-widest uppercase">
            {phase === 'show' && "Memorize!"}
            {phase === 'shuffle' && "Tracking..."}
            {phase === 'guess' && `Pick 3 boxes (${selectedIds.length}/3)`}
            {phase === 'result' && "Revealing..."}
          </div>
        </div>
      )}

      {/* GAME BOARD */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 p-6 flex items-center justify-center mb-8">
        {phase === 'idle' ? (
          <div className="py-12 text-6xl opacity-20">📦📦📦</div>
        ) : (
          <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full">
            {shells.map((shell) => {
              const isOpen = phase === 'show' || phase === 'result';
              const isSelected = selectedIds.includes(shell.id);

              // Frame motion magic: 'layout' prop handles the smooth shuffling animation automatically!
              return (
                <motion.button
                  layout
                  key={shell.id}
                  onClick={() => handleSelect(shell.id)}
                  disabled={phase !== 'guess'}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`relative aspect-square rounded-2xl flex items-center justify-center text-4xl sm:text-5xl transition-all
                    ${isSelected ? 'ring-4 ring-amber-400 scale-95' : 'hover:scale-105'}
                    ${phase === 'guess' ? 'cursor-pointer bg-slate-200 dark:bg-slate-800 shadow-md' : 'bg-slate-100 dark:bg-slate-900'}
                  `}
                >
                  {/* The Box */}
                  <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
                    📦
                  </span>

                  {/* The Hidden Treasure */}
                  <span className={`absolute transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                    {shell.hasTreasure ? '💎' : '💨'}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Game Over Overlay */}
        {phase === 'result' && shells.filter(s => selectedIds.includes(s.id) && s.hasTreasure).length < 3 && (
          <div className="absolute inset-0 bg-black/90 rounded-3xl flex flex-col items-center justify-center text-white z-10">
            <h2 className="text-4xl font-black text-rose-500 mb-2">You lost them!</h2>
            <button onClick={startGame} className="mt-6 px-8 py-3 bg-amber-500 text-white rounded-full font-bold hover:scale-105 active:scale-95 transition-transform">
              TRY AGAIN
            </button>
          </div>
        )}
      </div>

      {phase === 'idle' && (
        <button onClick={startGame} className="px-12 py-4 bg-amber-500 text-white rounded-full font-black text-2xl animate-bounce shadow-lg shadow-amber-500/30">
          START
        </button>
      )}
    </div>
  );
}