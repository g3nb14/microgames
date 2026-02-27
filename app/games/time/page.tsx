'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

type Phase = 'idle' | 'running' | 'result';

const generateTargetTime = () => {

  return Number((Math.random() * 3.5 + 2.5).toFixed(1));
};

export default function TimeSenseGame() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [targetTime, setTargetTime] = useState(3.0);
  const [actualTime, setActualTime] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const startTimeRef = useRef<number>(0);
  const animationRef = useRef<number | null>(null);
  const [displayTime, setDisplayTime] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('time_highscore');
    if (saved) {
      // eslint-disable-next-line
      setHighScore(parseInt(saved, 10));
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const startTimer = () => {
    setTargetTime(generateTargetTime());
    setPhase('running');
    setDisplayTime(0);
    startTimeRef.current = performance.now();

    const updateTimer = () => {
      const now = performance.now();
      setDisplayTime((now - startTimeRef.current) / 1000);
      animationRef.current = requestAnimationFrame(updateTimer);
    };
    animationRef.current = requestAnimationFrame(updateTimer);
  };

  const stopTimer = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    const endTime = performance.now();
    const finalTime = (endTime - startTimeRef.current) / 1000;
    setActualTime(finalTime);
    setPhase('result');


    const diff = Math.abs(finalTime - targetTime);
    if (diff <= 0.3) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('time_highscore', newScore.toString());
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      }
    } else {
      setScore(0);
    }
  };

  const diff = Math.abs(actualTime - targetTime);
  const isWin = phase === 'result' && diff <= 0.3;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 p-4 flex flex-col items-center">
      <div className="w-full max-w-xl flex justify-between items-center mb-6 mt-2">
        <Link href="/" className="text-violet-600 font-bold">← Back to Menu</Link>
        <div className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full font-bold text-sm">
          🏆 Streak: {highScore}
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-black mb-2 text-slate-800 dark:text-slate-100">Time Sense ⏱️</h1>
        <p className="text-slate-500 text-sm">Stop the clock at EXACTLY the target time. Margin of error: 0.3s.</p>
      </div>

      <div className="text-xl font-black text-slate-500 mb-2">Current Streak: <span className="text-violet-500">{score}</span></div>

      <div className="relative w-full max-w-sm h-64 bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center mb-8">
        {phase === 'idle' && (
          <div className="text-5xl opacity-20 animate-pulse">⏳</div>
        )}

        {phase === 'running' && (
          <>
            <div className="text-slate-400 text-sm font-bold mb-2">TARGET TIME</div>
            <div className="text-5xl font-black text-violet-500 mb-6">{targetTime.toFixed(1)}s</div>
            {/* hide timer after 1 second */}
            <div className={`text-3xl font-mono transition-opacity duration-300 ${displayTime > 1 ? 'opacity-0' : 'opacity-100 text-slate-800 dark:text-slate-200'}`}>
              {displayTime.toFixed(2)}s
            </div>
          </>
        )}

        {phase === 'result' && (
          <div className="flex flex-col items-center">
            <div className="text-slate-400 text-sm font-bold mb-2">TARGET: {targetTime.toFixed(1)}s</div>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-6xl font-black mb-2 ${isWin ? 'text-emerald-500' : 'text-rose-500'}`}
            >
              {actualTime.toFixed(2)}s
            </motion.div>
            <div className="text-slate-500 font-bold">
              Diff: {diff.toFixed(2)}s {isWin ? '✅' : '❌'}
            </div>
          </div>
        )}
      </div>

      {phase !== 'running' ? (
        <button onClick={startTimer} className="px-12 py-4 bg-violet-500 text-white rounded-full font-black text-2xl animate-bounce shadow-lg shadow-violet-500/30">
          {phase === 'result' ? 'TRY AGAIN' : 'START'}
        </button>
      ) : (
        <button onClick={stopTimer} className="px-16 py-6 bg-rose-500 text-white rounded-full font-black text-3xl active:scale-95 transition-transform shadow-lg shadow-rose-500/30">
          STOP!
        </button>
      )}
    </div>
  );
}