'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

type Rule = 'color' | 'shape' | 'count';
type Color = 'red' | 'green' | 'yellow' | 'blue';
type Shape = 'triangle' | 'star' | 'cross' | 'circle';

interface CardProps {
  color: Color;
  shape: Shape;
  count: number;
}

const RULES: Rule[] = ['color', 'shape', 'count'];
const COLORS: Color[] = ['red', 'green', 'yellow', 'blue'];
const SHAPES: Shape[] = ['triangle', 'star', 'cross', 'circle'];

// Classic WCST fixed target cards
const TARGET_CARDS: CardProps[] = [
  { count: 1, color: 'red', shape: 'triangle' },
  { count: 2, color: 'green', shape: 'star' },
  { count: 3, color: 'yellow', shape: 'cross' },
  { count: 4, color: 'blue', shape: 'circle' },
];

const COLOR_MAP: Record<Color, string> = {
  red: '#ef4444',
  green: '#10b981',
  yellow: '#eab308',
  blue: '#3b82f6'
};

const ShapeIcon = ({ shape, colorHex }: { shape: Shape; colorHex: string }) => {
  if (shape === 'triangle') return <path d="M12 2L22 20H2L12 2Z" fill={colorHex} />;
  if (shape === 'star') return <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={colorHex} />;
  if (shape === 'cross') return <path d="M19 10H14V5H10V10H5V14H10V19H14V14H19V10Z" fill={colorHex} />;
  // circle
  return <circle cx="12" cy="12" r="10" fill={colorHex} />;
};

const generateRandomCard = (): CardProps => ({
  color: COLORS[Math.floor(Math.random() * COLORS.length)],
  shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
  count: Math.floor(Math.random() * 4) + 1,
});

export default function RuleSwitcherGame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const [currentRule, setCurrentRule] = useState<Rule>('color');
  const [activeCard, setActiveCard] = useState<CardProps | null>(null);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('rule_highscore');
    if (saved) {
      // eslint-disable-next-line
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setMistakes(0);
    setConsecutiveCorrect(0);
    setCurrentRule(RULES[Math.floor(Math.random() * RULES.length)]);
    setActiveCard(generateRandomCard());
    setFeedback(null);
  };

  const handleSort = (targetCard: CardProps) => {
    if (!isPlaying || !activeCard) return;

    const isMatch = activeCard[currentRule] === targetCard[currentRule];

    if (isMatch) {
      setFeedback('correct');
      const newScore = score + 1;
      setScore(newScore);

      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('rule_highscore', newScore.toString());
        if (newScore % 10 === 0) confetti({ particleCount: 100, spread: 60 });
      }

      const newConsecutive = consecutiveCorrect + 1;

      // Silently change the rule after 4 to 6 correct answers
      if (newConsecutive >= 4 && Math.random() > 0.5) {
        const availableRules = RULES.filter(r => r !== currentRule);
        setCurrentRule(availableRules[Math.floor(Math.random() * availableRules.length)]);
        setConsecutiveCorrect(0);
      } else {
        setConsecutiveCorrect(newConsecutive);
      }

    } else {
      setFeedback('wrong');
      setConsecutiveCorrect(0);
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (newMistakes >= 3) {
        setIsPlaying(false); // Game over after 3 mistakes
        return;
      }
    }

    // Generate next card
    setTimeout(() => {
      setActiveCard(generateRandomCard());
      setFeedback(null);
    }, 400);
  };

  const renderCard = (card: CardProps, isTarget = false) => {
    const colorHex = COLOR_MAP[card.color];
    return (
      <div className={`flex flex-wrap items-center justify-center gap-1 bg-white dark:bg-slate-800 rounded-xl shadow-md border-2 border-slate-200 dark:border-slate-700 aspect-[3/4] p-2 sm:p-4 ${isTarget ? 'w-16 sm:w-24' : 'w-32 sm:w-48'} transition-transform hover:scale-105 cursor-pointer`}>
        {Array.from({ length: card.count }).map((_, i) => (
          <svg key={i} viewBox="0 0 24 24" className={`${isTarget ? 'w-4 h-4 sm:w-8 sm:h-8' : 'w-10 h-10 sm:w-16 sm:h-16'}`}>
            <ShapeIcon shape={card.shape} colorHex={colorHex} />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl flex justify-between items-center mb-6 mt-2">
        <Link href="/" className="text-pink-600 font-bold">← Back to Menu</Link>
        <div className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full font-bold text-sm">
          🏆 Max Score: {highScore}
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-black mb-2 text-slate-800 dark:text-slate-100">Rule Switcher 🔀</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Match the center card to a target pile. The matching rule (Color, Shape, or Count) is hidden and changes silently! 3 strikes and you are out.
        </p>
      </div>

      {isPlaying && (
        <div className="flex justify-between items-center w-full max-w-md mb-8 px-4">
          <div className="text-xl font-bold text-slate-500">Score: <span className="text-pink-500 text-3xl">{score}</span></div>
          <div className="text-xl font-bold text-slate-500 flex gap-1">
            Strikes:
            {[1, 2, 3].map(i => (
              <span key={i} className={i <= mistakes ? 'text-rose-500' : 'text-slate-300 dark:text-slate-700'}>❌</span>
            ))}
          </div>
        </div>
      )}

      {!isPlaying && mistakes >= 3 && (
        <div className="mb-8 text-center bg-rose-100 dark:bg-rose-900/30 p-6 rounded-3xl border-2 border-rose-500 text-rose-600 dark:text-rose-400">
          <h2 className="text-3xl font-black mb-2">Game Over!</h2>
          <p className="text-xl font-bold">You scored {score} points.</p>
        </div>
      )}

      <div className="relative w-full max-w-2xl flex flex-col items-center justify-center gap-12 mb-8">
        {/* ACTIVE CARD TO SORT */}
        <div className="h-48 flex items-center justify-center relative">
          <AnimatePresence mode="popLayout">
            {isPlaying && activeCard && !feedback && (
              <motion.div
                key={score} // Forces re-render animation when score changes
                initial={{ y: -50, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                {renderCard(activeCard, false)}
              </motion.div>
            )}
          </AnimatePresence>

          {feedback === 'correct' && <div className="absolute text-6xl drop-shadow-lg z-10 animate-bounce">✅</div>}
          {feedback === 'wrong' && <div className="absolute text-6xl drop-shadow-lg z-10 animate-shake">❌</div>}
        </div>

        {/* TARGET PILES */}
        {isPlaying && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-6 w-full">
            {TARGET_CARDS.map((target, idx) => (
              <div key={idx} onClick={() => handleSort(target)}>
                {renderCard(target, true)}
              </div>
            ))}
          </div>
        )}
      </div>

      {!isPlaying && (
        <button onClick={startGame} className="px-12 py-4 bg-pink-500 text-white rounded-full font-black text-2xl animate-bounce shadow-lg shadow-pink-500/30">
          {mistakes >= 3 ? 'PLAY AGAIN' : 'START'}
        </button>
      )}
    </div>
  );
}