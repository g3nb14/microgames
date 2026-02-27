'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const ALL_EMOJIS = ['🍎', '🐱', '🚀', '⭐️', '🐸', '👾', '🌈', '🍕', '🌍', '🎸', '💎', '🏀', '🍉', '🚗', '🎈', '🦊', '🍔', '☀️'];

export default function MemoryGame() {
  const [cards, setCards] = useState<{ id: number; symbol: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [level, setLevel] = useState(1);

  // New states for moves and victory
  const [moves, setMoves] = useState(0);
  const [showVictory, setShowVictory] = useState(false);
  const [stars, setStars] = useState(3);

  useEffect(() => {
    const savedLevel = localStorage.getItem('memory_level');
    if (savedLevel) {
      // eslint-disable-next-line
      setLevel(parseInt(savedLevel));
    }
  }, []);

  const initGame = (currentLevel: number) => {
    const pairsCount = Math.min(currentLevel * 2 + 2, ALL_EMOJIS.length);
    const gameEmojis = ALL_EMOJIS.slice(0, pairsCount);

    const deck = [...gameEmojis, ...gameEmojis]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(deck);
    setFlippedCards([]);
    setDisabled(false);
    setMoves(0);
    setShowVictory(false);
  };

  useEffect(() => {
    initGame(level);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const handleCardClick = (id: number) => {
    if (disabled || cards[id].isFlipped || cards[id].isMatched) return;

    const updatedCards = cards.map(card =>
      card.id === id ? { ...card, isFlipped: true } : card
    );
    setCards(updatedCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    // When two cards are opened - it counts as 1 move
    if (newFlipped.length === 2) {
      setDisabled(true);
      setMoves(prev => prev + 1); // Increment moves counter

      const [first, second] = newFlipped;

      if (updatedCards[first].symbol === updatedCards[second].symbol) {
        // Matched a pair!
        const matchedCards = updatedCards.map(card =>
          card.id === first || card.id === second ? { ...card, isMatched: true } : card
        );
        setCards(matchedCards);
        setFlippedCards([]);
        setDisabled(false);

        // CHECK FOR VICTORY
        if (matchedCards.every(c => c.isMatched)) {
          confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 } });

          // Calculate stars (optimal: number of pairs)
          const pairsCount = matchedCards.length / 2;
          const currentMoves = moves + 1; // Include current successful move

          let earnedStars = 1;
          if (currentMoves <= pairsCount + Math.floor(pairsCount * 0.5)) {
            earnedStars = 3; // Perfect or a couple of mistakes
          } else if (currentMoves <= pairsCount + Math.floor(pairsCount * 1.5)) {
            earnedStars = 2; // Average
          }

          setStars(earnedStars);
          setTimeout(() => setShowVictory(true), 500); // Show victory screen with a slight delay
        }
      } else {
        // Did not match
        setTimeout(() => {
          setCards(prevCards => prevCards.map(card =>
            card.id === first || card.id === second ? { ...card, isFlipped: false } : card
          ));
          setFlippedCards([]);
          setDisabled(false);
        }, 800);
      }
    }
  };

  const nextLevel = () => {
    const nextLvl = level + 1;
    setLevel(nextLvl);
    localStorage.setItem('memory_level', nextLvl.toString());
  };

  const resetProgress = () => {
    localStorage.removeItem('memory_level');
    setLevel(1);
    initGame(1);
  };

  const totalCards = cards.length;
  let gridColsClass = 'grid-cols-4';
  let cardSizeClass = 'w-16 h-20 sm:w-24 sm:h-32 text-4xl sm:text-6xl';

  if (totalCards > 24) {
    gridColsClass = 'grid-cols-5 sm:grid-cols-6';
    cardSizeClass = 'w-12 h-12 sm:w-16 sm:h-20 text-2xl sm:text-3xl';
  } else if (totalCards > 16) {
    gridColsClass = 'grid-cols-4 sm:grid-cols-6';
    cardSizeClass = 'w-14 h-16 sm:w-20 sm:h-24 text-3xl sm:text-4xl';
  } else if (totalCards > 8) {
    gridColsClass = 'grid-cols-4';
    cardSizeClass = 'w-16 h-20 sm:w-20 sm:h-24 text-3xl sm:text-4xl';
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 p-4 sm:p-8 flex flex-col items-center overflow-x-hidden relative">
      <div className="w-full max-w-3xl flex justify-between items-center mb-4 mt-2">
        <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform font-bold">
          ← Back to Menu
        </Link>
        <div className="flex gap-3">
          <div className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-1 rounded-full font-bold shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
            Moves: {moves}
          </div>
          <div className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-1 rounded-full font-black shadow-md animate-pulse transition-colors">
            Level: {level}
          </div>
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-black mb-8 text-slate-800 dark:text-slate-100 text-center transition-colors">Memory Match 🧠</h1>

      <div className={`grid ${gridColsClass} gap-2 sm:gap-3 lg:gap-4 transition-all duration-500 ease-in-out place-items-center relative`}>
        {cards.map((card) => (
          <motion.div
            key={card.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCardClick(card.id)}
            className={`${cardSizeClass} flex items-center justify-center rounded-xl cursor-pointer shadow-md dark:shadow-none border border-transparent dark:border-slate-700 transition-all duration-300 ${
              card.isFlipped || card.isMatched 
                ? 'bg-white dark:bg-slate-800' 
                : 'bg-indigo-500 dark:bg-indigo-600'
            }`}
          >
            {card.isFlipped || card.isMatched ? card.symbol : ''}
          </motion.div>
        ))}
      </div>

      {/* VICTORY OVERLAY */}
      <AnimatePresence>
        {showVictory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-slate-900/80 dark:bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-8 rounded-3xl shadow-2xl dark:shadow-none border border-transparent dark:border-slate-800 flex flex-col items-center max-w-sm w-full text-center transition-colors"
            >
              <h2 className="text-3xl font-black mb-2">Awesome! 🎉</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-6 transition-colors">Level {level} completed</p>

              {/* STARS */}
              <div className="flex gap-2 text-5xl mb-6 drop-shadow-md">
                {[1, 2, 3].map((starIndex) => (
                  <span key={starIndex} className={`transition-all duration-500 ${starIndex <= stars ? 'opacity-100 scale-110' : 'opacity-20 grayscale'}`}>
                    ⭐
                  </span>
                ))}
              </div>

              <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 w-full mb-8 border border-slate-200 dark:border-slate-700 transition-colors">
                <p className="text-slate-600 dark:text-slate-400 font-medium text-sm transition-colors">Moves taken</p>
                <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 transition-colors">{moves}</p>
              </div>

              <button
                onClick={nextLevel}
                className="w-full py-4 bg-indigo-600 text-white rounded-full font-black text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-lg hover:shadow-indigo-500/30"
              >
                Next Level ➡️
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={resetProgress}
        className="mt-12 px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 rounded-full font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 transition-colors text-sm z-0"
      >
        Reset Progress
      </button>
    </div>
  );
}