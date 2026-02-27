'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const BUTTONS = [
  { id: 0, color: 'bg-rose-500', glow: 'bg-rose-300', shadow: 'shadow-rose-500/60' },
  { id: 1, color: 'bg-blue-500', glow: 'bg-blue-300', shadow: 'shadow-blue-500/60' },
  { id: 2, color: 'bg-emerald-500', glow: 'bg-emerald-300', shadow: 'shadow-emerald-500/60' },
  { id: 3, color: 'bg-amber-400', glow: 'bg-amber-200', shadow: 'shadow-amber-400/60' }
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Added 'processing' phase for a micro-pause between rounds
type GamePhase = 'idle' | 'computer' | 'player' | 'processing' | 'success' | 'gameover';

export default function SimonGame() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('simon_highscore');
    if (saved) {
      // eslint-disable-next-line
      setHighScore(parseInt(saved));
    }
  }, []);

  const playSequence = async (seq: number[]) => {
    setPhase('computer');
    await sleep(600);

    const speed = Math.max(200, 600 - seq.length * 30);
    const gap = Math.max(100, 300 - seq.length * 15);

    for (let i = 0; i < seq.length; i++) {
      setActiveButton(seq[i]);
      await sleep(speed);
      setActiveButton(null);
      await sleep(gap);
    }

    setPhase('player');
  };

  const startGame = () => {
    setSequence([]);
    setPlayerSequence([]);
    setPhase('computer');
    nextRound([]);
  };

  const nextRound = (currentSeq: number[]) => {
    // eslint-disable-next-line
    const nextColor = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, nextColor];
    setSequence(newSeq);
    setPlayerSequence([]);
    playSequence(newSeq);
  };

  const handlePlayerClick = (id: number) => {
    if (phase !== 'player') return;

    setActiveButton(id);
    setTimeout(() => setActiveButton(null), 200); // Button glows for 200ms

    const newPlayerSeq = [...playerSequence, id];
    setPlayerSequence(newPlayerSeq);

    const currentIndex = newPlayerSeq.length - 1;

    if (newPlayerSeq[currentIndex] !== sequence[currentIndex]) {
      setPhase('gameover');

      const finalScore = sequence.length - 1;
      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem('simon_highscore', finalScore.toString());
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      }
      return;
    }

    if (newPlayerSeq.length === sequence.length) {
      // Player clicked everything correctly. Start a short pause!
      setPhase('processing'); // Clicks are blocked, but the 👇 finger is still visible

      setTimeout(() => {
        setPhase('success'); // Checkmark ✅ appears after 300ms

        setTimeout(() => {
          nextRound(sequence); // Game continues after another second
        }, 1000);
      }, 300); // 300ms delay gives the last button time to turn off its glow
    }
  };

  const currentScore = Math.max(0, sequence.length - 1);

  const renderCenterIcon = () => {
    switch (phase) {
      case 'idle': return <span className="text-3xl sm:text-4xl opacity-50 transition-opacity">💤</span>;
      case 'computer': return <span className="text-4xl sm:text-5xl animate-pulse">👀</span>;
      case 'player':
      case 'processing': // Show the finger during the processing pause too
        return <span className="text-4xl sm:text-5xl">👇</span>;
      case 'success': return <span className="text-4xl sm:text-5xl animate-bounce drop-shadow-md">✅</span>;
      case 'gameover': return <span className="text-4xl sm:text-5xl">💥</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 p-4 flex flex-col items-center overflow-hidden relative">
      <div className="w-full max-w-xl flex justify-between items-center mb-8 mt-2">
        <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform font-bold">
          ← Back to Menu
        </Link>
        <div className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors px-4 py-1 rounded-full font-bold text-sm">
          🏆 High Score: {highScore}
        </div>
      </div>

      <h1 className="text-4xl font-black mb-2 text-slate-800 dark:text-slate-100 transition-colors text-center">Simon Says 🎨</h1>

      <div className="text-slate-500 dark:text-slate-400 font-medium text-xl mb-12 flex items-center gap-4 transition-colors">
        Score: <span className="font-black text-3xl text-indigo-600 dark:text-indigo-400 transition-colors">{currentScore}</span>
      </div>

      <div className="relative w-72 h-72 sm:w-96 sm:h-96 bg-slate-200 dark:bg-slate-800 rounded-full p-4 sm:p-6 shadow-inner dark:shadow-none border border-transparent dark:border-slate-700 flex flex-wrap justify-center items-center gap-2 sm:gap-4 transition-colors duration-500">

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-28 sm:h-28 bg-slate-50 dark:bg-slate-900 rounded-full z-10 flex items-center justify-center shadow-lg dark:shadow-none border-4 border-slate-200 dark:border-slate-700 transition-colors duration-300">
          {renderCenterIcon()}
        </div>

        {BUTTONS.map((btn, index) => (
          <motion.div
            key={btn.id}
            whileTap={phase === 'player' ? { scale: 0.92 } : {}}
            onPointerDown={() => handlePlayerClick(btn.id)}
            className={`w-[46%] h-[46%] rounded-full cursor-pointer transition-all duration-200 ${
              activeButton === btn.id 
                ? `${btn.glow} scale-105 shadow-2xl ${btn.shadow}` 
                : `${btn.color} shadow-md dark:shadow-none border border-transparent dark:border-slate-700/50`
            } ${phase !== 'player' ? 'pointer-events-none' : 'hover:scale-[1.02]'}`}
            style={{
              borderTopLeftRadius: index === 0 ? '100%' : '1rem',
              borderTopRightRadius: index === 1 ? '100%' : '1rem',
              borderBottomLeftRadius: index === 2 ? '100%' : '1rem',
              borderBottomRightRadius: index === 3 ? '100%' : '1rem',
            }}
          />
        ))}
      </div>

      {phase === 'gameover' && (
        <div className="mt-12 text-center animate-in slide-in-from-bottom-4">
          <h2 className="text-3xl font-black text-rose-600 dark:text-rose-500 mb-2 transition-colors">Oops, wrong color!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium transition-colors">You scored: {currentScore} points</p>
          <button
            onClick={startGame}
            className="px-8 py-3 bg-indigo-600 text-white rounded-full font-black text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-lg"
          >
            TRY AGAIN
          </button>
        </div>
      )}

      {phase === 'idle' && (
        <button
          onClick={startGame}
          className="mt-16 px-12 py-4 bg-indigo-600 text-white rounded-full font-black text-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg hover:shadow-indigo-500/30 animate-bounce"
        >
          START
        </button>
      )}
    </div>
  );
}