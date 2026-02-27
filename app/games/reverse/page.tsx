'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

type Phase = 'idle' | 'memorize' | 'input' | 'success' | 'gameover';

// ВЫНОСИМ ФУНКЦИЮ НАРУЖУ, чтобы строгий линтер React не ругался на Math.random()
const generateSequence = (lvl: number) => {
  const length = lvl + 2; // Level 1 starts with 3 digits
  const newSeq = [];
  for (let i = 0; i < length; i++) {
    newSeq.push(Math.floor(Math.random() * 10)); // Digits 0-9
  }
  return newSeq;
};

export default function ReverseRecallGame() {
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState<Phase>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('reverse_highscore');
    if (saved) {
      // eslint-disable-next-line
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  const startLevel = (currentLevel: number) => {
    setPlayerInput([]);
    const newSeq = generateSequence(currentLevel);
    setSequence(newSeq);
    setPhase('memorize');

    // Show digits for 1 second per digit
    const displayTime = newSeq.length * 1000;
    setTimeout(() => {
      setPhase('input');
    }, displayTime);
  };

  const startGame = () => {
    setLevel(1);
    startLevel(1);
  };

  const handleInput = (num: number) => {
    if (phase !== 'input') return;

    const newPlayerInput = [...playerInput, num];
    setPlayerInput(newPlayerInput);

    // The correct sequence is the REVERSED original sequence
    const reversedSequence = [...sequence].reverse();
    const currentIndex = newPlayerInput.length - 1;

    // Validate current input
    if (newPlayerInput[currentIndex] !== reversedSequence[currentIndex]) {
      // Wrong digit!
      setPhase('gameover');
      if (level > highScore) {
        // eslint-disable-next-line
        setHighScore(level);
        localStorage.setItem('reverse_highscore', level.toString());
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      }
      return;
    }

    // Check if level is complete
    if (newPlayerInput.length === sequence.length) {
      setPhase('success');
      setTimeout(() => {
        const nextLvl = level + 1;
        setLevel(nextLvl);
        startLevel(nextLvl);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 p-4 flex flex-col items-center overflow-x-hidden relative">
      <div className="w-full max-w-xl flex justify-between items-center mb-6 mt-2">
        <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform font-bold">
          ← Back to Menu
        </Link>
        <div className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full font-bold text-xs sm:text-sm transition-colors">
          🏆 High Score: Lvl {highScore}
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-black mb-2 text-slate-800 dark:text-slate-100 transition-colors">Reverse Recall ⏪</h1>
        {!phase.includes('gameover') && phase !== 'idle' && (
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto text-sm transition-colors">
            Memorize the digits. When they hide, type them in <strong>REVERSE</strong> order!
          </p>
        )}
      </div>

      {phase !== 'idle' && (
        <div className="flex justify-center items-center mb-6">
          <div className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-6 py-2 rounded-xl font-black text-xl shadow-sm border-2 border-emerald-200 dark:border-emerald-800/50 transition-colors">
            Level: {level}
          </div>
        </div>
      )}

      {/* GAME BOARD */}
      <div className="relative w-full max-w-md h-40 sm:h-48 bg-white dark:bg-slate-900 rounded-3xl shadow-lg dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center mb-8 px-6 overflow-hidden transition-colors duration-300">
        <AnimatePresence mode="wait">
          {phase === 'memorize' && (
            <motion.div
              key="memorize"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-[0.5em] ml-[0.5em] transition-colors"
            >
              {sequence.join('')}
            </motion.div>
          )}

          {phase === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-[0.5em] ml-[0.5em] transition-colors"
            >
              {playerInput.length === 0 ? '?' : playerInput.join('')}
            </motion.div>
          )}

          {phase === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-emerald-500 font-black text-4xl sm:text-5xl drop-shadow-md"
            >
              Correct! ✅
            </motion.div>
          )}
        </AnimatePresence>

        {phase === 'gameover' && (
          <div className="absolute inset-0 bg-slate-900/95 dark:bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10 p-6 text-center transition-colors">
            <h2 className="text-3xl sm:text-4xl font-black mb-2 text-rose-500">Wrong Digit!</h2>
            <p className="text-slate-300 mb-2">The reverse was: <br/><span className="font-black text-2xl text-white">{[...sequence].reverse().join('')}</span></p>
            <p className="text-xl mt-4">You reached <span className="font-black text-amber-400 text-3xl">Level {level}</span></p>
          </div>
        )}
      </div>

      {/* NUMPAD */}
      {(phase === 'input' || phase === 'success') && (
        <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-md">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
            <button
              key={num}
              onClick={() => handleInput(num)}
              disabled={phase !== 'input'}
              className="aspect-square bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl font-black text-2xl sm:text-3xl shadow-sm hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50"
            >
              {num}
            </button>
          ))}
        </div>
      )}

      {(phase === 'idle' || phase === 'gameover') && (
        <button
          onClick={startGame}
          className="mt-4 px-12 py-4 bg-indigo-600 text-white rounded-full font-black text-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg hover:shadow-indigo-500/30 animate-bounce z-0"
        >
          {phase === 'gameover' ? 'TRY AGAIN' : 'START'}
        </button>
      )}
    </div>
  );
}