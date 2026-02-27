'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function TilesGame() {
  const [tiles, setTiles] = useState<(number | null)[]>([]);
  const [won, setWon] = useState(false);

  // 1. Declare win check function first
  const checkWin = (currentTiles: (number | null)[]) => {
    // Explicitly tell TypeScript that it can contain numbers and null
    const winState: (number | null)[] = [...Array(15).keys()].map(i => i + 1);
    winState.push(null);

    if (currentTiles.every((val, i) => val === winState[i])) {
      setWon(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  // 2. Declare shuffle function
  const shuffle = () => {
    const initial: (number | null)[] = [...Array(15).keys()].map(i => i + 1);
    initial.push(null);

    // Fisher-Yates shuffle
    for (let i = initial.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [initial[i], initial[j]] = [initial[j], initial[i]];
    }
    setTiles(initial);
    setWon(false);
  };

  // 3. Tile movement logic
  const moveTile = (index: number) => {
    if (won) return;

    const emptyIndex = tiles.indexOf(null);
    const row = Math.floor(index / 4);
    const emptyRow = Math.floor(emptyIndex / 4);
    const col = index % 4;
    const emptyCol = emptyIndex % 4;

    const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;

    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      checkWin(newTiles);
    }
  };

  // 4. Call functions in useEffect
  useEffect(() => {
    shuffle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 p-4 sm:p-8 flex flex-col items-center overflow-x-hidden relative">
      {/* Standard Header */}
      <div className="w-full max-w-xl flex justify-between items-center mb-6 mt-2">
        <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform font-bold">
          ← Back to Menu
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-black mb-2 text-slate-800 dark:text-slate-100 transition-colors">15 Puzzle 🧩</h1>
        {!won && (
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto text-sm transition-colors">
            Slide the tiles to put the numbers in order from 1 to 15!
          </p>
        )}
      </div>

      {won && (
        <div className="mb-6 text-emerald-500 font-extrabold text-2xl animate-bounce drop-shadow-sm">
          Victory! You are awesome! 🎉
        </div>
      )}

      {/* GAME BOARD */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 bg-slate-300 dark:bg-slate-800 p-3 sm:p-4 rounded-2xl shadow-inner transition-colors duration-500">
        {tiles.map((tile, index) => (
          <button
            key={index}
            onClick={() => moveTile(index)}
            disabled={!tile || won}
            className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-2xl sm:text-3xl font-black rounded-xl transition-all duration-200
              ${tile 
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-md dark:shadow-none border border-transparent dark:border-slate-600 hover:scale-105 active:scale-95 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600' 
                : 'bg-transparent cursor-default'}`}
          >
            {tile}
          </button>
        ))}
      </div>

      <button
        onClick={shuffle}
        className="mt-12 px-10 py-4 bg-indigo-600 text-white rounded-full font-black text-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg hover:shadow-indigo-500/30"
      >
        SHUFFLE
      </button>
    </div>
  );
}