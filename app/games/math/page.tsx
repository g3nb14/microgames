'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

type EquationData = {
  text: string;
  isCorrect: boolean;
};

export default function MathGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [equation, setEquation] = useState<EquationData | null>(null);

  // SMART RANDOM: Prevent more than 2 True/False answers in a row
  const streakRef = useRef({ type: false, count: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('math_highscore');
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
        localStorage.setItem('math_highscore', score.toString());
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, timeLeft]);

  // EQUATION GENERATOR (Difficulty increases with score)
  const generateEquation = () => {
    // eslint-disable-next-line
    let isMatch = Math.random() > 0.5;

    // INTERFERE WITH RANDOM: Break streaks > 2
    if (streakRef.current.count >= 2) {
      isMatch = !streakRef.current.type;
    }

    if (streakRef.current.type === isMatch) {
      streakRef.current.count += 1;
    } else {
      streakRef.current.type = isMatch;
      streakRef.current.count = 1;
    }

    let num1, num2, realAnswer, operator;
    const currentLevel = Math.floor(score / 5) + 1; // Difficulty increases every 5 points

    // eslint-disable-next-line
    const randomOp = Math.random();

    if (currentLevel <= 2) {
      // Levels 1-2: Only + and -, numbers up to 20
      operator = randomOp > 0.5 ? '+' : '-';
      // eslint-disable-next-line
      num1 = Math.floor(Math.random() * 20) + 1;
      // eslint-disable-next-line
      num2 = Math.floor(Math.random() * 20) + 1;
      if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1]; // Avoid negative numbers
      realAnswer = operator === '+' ? num1 + num2 : num1 - num2;
    } else {
      // Levels 3+: Add multiplication and larger numbers
      if (randomOp > 0.6) {
        operator = '×';
        // eslint-disable-next-line
        num1 = Math.floor(Math.random() * 9) + 2; // From 2 to 10
        // eslint-disable-next-line
        num2 = Math.floor(Math.random() * 9) + 2;
        realAnswer = num1 * num2;
      } else {
        operator = randomOp > 0.3 ? '+' : '-';
        // eslint-disable-next-line
        num1 = Math.floor(Math.random() * 50) + 10;
        // eslint-disable-next-line
        num2 = Math.floor(Math.random() * 50) + 10;
        if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1];
        realAnswer = operator === '+' ? num1 + num2 : num1 - num2;
      }
    }

    let displayedAnswer = realAnswer;
    if (!isMatch) {
      // Generate a plausible error (off by 1, 2, or 10)
      // eslint-disable-next-line
      const errorMargin = Math.random() > 0.5 ? (Math.floor(Math.random() * 3) + 1) : 10;
      // eslint-disable-next-line
      displayedAnswer = Math.random() > 0.5 ? realAnswer + errorMargin : realAnswer - errorMargin;
      // Protect against negative displayed answers
      if (displayedAnswer < 0) displayedAnswer = realAnswer + errorMargin;
    }

    setEquation({
      text: `${num1} ${operator} ${num2} = ${displayedAnswer}`,
      isCorrect: isMatch
    });
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setIsGameOver(false);
    streakRef.current = { type: false, count: 0 };
    generateEquation();
  };

  const handleGuess = (userSaysTrue: boolean) => {
    if (!isPlaying || !equation) return;

    if (userSaysTrue === equation.isCorrect) {
      setScore((prev) => prev + 1);
    } else {
      setScore((prev) => prev - 1); // Penalty for mistake!
    }

    generateEquation();
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
        <h1 className="text-3xl sm:text-4xl font-black mb-2 text-slate-800 dark:text-slate-100 transition-colors">Math Rush 🧮</h1>
        {!isPlaying && !isGameOver && (
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto text-sm transition-colors">
            Is the equation correct? Answer quickly before time runs out! The better you play, the harder it gets.
          </p>
        )}
      </div>

      {isPlaying && (
        <div className="flex justify-center items-center gap-8 mb-8">
          <div className="text-slate-500 dark:text-slate-400 transition-colors font-medium text-xl">
            Score: <span className={`font-black text-3xl ml-2 transition-colors ${score < 0 ? 'text-rose-600' : 'text-indigo-600 dark:text-indigo-400'}`}>{score}</span>
          </div>
          <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-6 py-2 rounded-xl font-black text-2xl shadow-sm border-2 border-indigo-200 dark:border-indigo-800/50 transition-colors animate-pulse">
            ⏱ {timeLeft}
          </div>
        </div>
      )}

      {/* EQUATION CARD */}
      <div className="relative w-full max-w-lg h-40 sm:h-52 bg-white dark:bg-slate-900 rounded-3xl shadow-lg dark:shadow-none border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-8 px-6 overflow-hidden transition-all duration-300">
        {isPlaying && equation ? (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={equation.text + score} // Changes on every answer
              initial={{ scale: 0.5, opacity: 0, x: 50 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.8, opacity: 0, x: -50 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="text-5xl sm:text-7xl font-black text-slate-800 dark:text-slate-100 transition-colors tracking-tight drop-shadow-sm select-none whitespace-nowrap"
            >
              {equation.text}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-6xl opacity-20 transition-opacity">🧮</div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10 p-6 rounded-3xl text-center">
            <h2 className="text-3xl sm:text-4xl font-black mb-2 animate-pulse text-indigo-300">Time&apos;s Up!</h2>
            <p className="text-xl">Your score: <span className="text-amber-400 font-black text-4xl">{score}</span></p>
          </div>
        )}
      </div>

      {isPlaying ? (
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
          <button
            onClick={() => handleGuess(false)}
            className="flex-1 py-4 sm:py-5 bg-rose-500 text-white rounded-2xl font-black text-lg sm:text-xl hover:bg-rose-600 active:scale-95 transition-all shadow-lg hover:shadow-rose-500/30"
          >
            ❌ FALSE
          </button>
          <button
            onClick={() => handleGuess(true)}
            className="flex-1 py-4 sm:py-5 bg-emerald-500 text-white rounded-2xl font-black text-lg sm:text-xl hover:bg-emerald-600 active:scale-95 transition-all shadow-lg hover:shadow-emerald-500/30"
          >
            TRUE ✅
          </button>
        </div>
      ) : (
        <button
          onClick={startGame}
          className="mt-4 px-12 py-4 bg-indigo-600 text-white rounded-full font-black text-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg hover:shadow-indigo-500/30 animate-bounce z-0"
        >
          {isGameOver ? 'PLAY AGAIN' : 'START'}
        </button>
      )}
    </div>
  );
}