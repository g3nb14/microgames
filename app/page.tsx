'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [scores, setScores] = useState<Record<string, string | null>>({});
  const [isMounted, setIsMounted] = useState(false);

  // Состояние для темной темы
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setIsMounted(true);

    // Загружаем рекорды
    const getScore = (key: string, suffix = '', prefix = '🏆 ') => {
      const val = localStorage.getItem(key);
      return val ? `${prefix}${val}${suffix}` : null;
    };

    setScores({
      memory: getScore('memory_level', '', '⭐ Lvl '),
      tiles: getScore('tiles_highscore', ' pts'),
      catch: getScore('catch_highscore_v3', ' pts'),
      simon: getScore('simon_highscore', ' pts'),
      colors: getScore('colors_highscore_v3', ' pts'),
      shapes: getScore('shapes_highscore', ' pts'),
      chimp: getScore('chimp_highscore', ' pts'),
      schulte: getScore('schulte_best', 's', '⏱ '),
      pattern: getScore('pattern_highscore', '', '🏆 Lvl '),
      math: getScore('math_highscore', ' pts'),
      odd: getScore('odd_highscore', ' pts'),
      arrows: getScore('arrows_highscore', ' pts')
    });

    // Проверяем сохраненную тему (или системную)
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Функция переключения темы
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const games = [
  { id: 'memory', title: 'Memory Match', description: 'Train your memory. Complete all levels!', icon: '🧠', path: '/games/memory', color: 'from-pink-500 to-rose-500' },
  { id: 'tiles', title: '15 Puzzle', description: 'The classic number sliding puzzle.', icon: '🧩', path: '/games/tiles', color: 'from-indigo-500 to-purple-600' },
  { id: 'catch', title: 'Catch the Monster', description: 'Test your reaction speed!', icon: '👾', path: '/games/catch', color: 'from-emerald-400 to-teal-500' },
  { id: 'simon', title: 'Simon Says', description: 'Repeat the color sequence!', icon: '🎨', path: '/games/simon', color: 'from-amber-400 to-orange-500' },
  { id: 'colors', title: 'Color Clash', description: "Don't trust your eyes! Sync your brain hemispheres.", icon: '🌈', path: '/games/colors', color: 'from-cyan-400 to-blue-500' },
  { id: 'shapes', title: 'Shape Clash', description: "Shape or text? Don't let your brain get confused!", icon: '🔺', path: '/games/shapes', color: 'from-violet-500 to-fuchsia-500' },
  { id: 'chimp', title: 'Chimp Test', description: 'Are you smarter than a chimpanzee? Test your spatial memory!', icon: '🐒', path: '/games/chimp', color: 'from-orange-400 to-red-500' },
  { id: 'schulte', title: 'Schulte Table', description: 'Expand your peripheral vision and boost speed reading!', icon: '🔢', path: '/games/schulte', color: 'from-lime-500 to-green-600' },
  { id: 'pattern', title: 'Pattern Memory', description: 'Memorize the grid. The board grows, the patterns get wilder!', icon: '🧩', path: '/games/pattern', color: 'from-rose-400 to-orange-500' },
  { id: 'math', title: 'Math Rush', description: 'Calculate fast under pressure. True or False?', icon: '🧮', path: '/games/math', color: 'from-blue-600 to-indigo-700' },
  { id: 'odd', title: 'Odd One Out', description: 'Find the symbol that breaks the pattern. Spot it fast!', icon: '🕵️‍♂️', path: '/games/odd', color: 'from-fuchsia-500 to-pink-600' },
  { id: 'arrows', title: 'Arrow Dash', description: 'Focus on the center arrow. Ignore the crowd!', icon: '⬅️', path: '/games/arrows', color: 'from-slate-600 to-slate-800' },
  { id: 'nback', title: 'N-Back Challenge', description: 'The ultimate memory test. Does this match the one 2 steps ago?', icon: '🧠', path: '/games/nback', color: 'from-fuchsia-600 to-purple-700' },
  { id: 'reverse', title: 'Reverse Recall', description: 'Memorize the sequence, then type it BACKWARDS.', icon: '⏪', path: '/games/reverse', color: 'from-emerald-500 to-teal-700' },
  { id: 'spatial', title: 'Spatial Trap', description: 'Ignore where the arrow IS. Tell me where it POINTS.', icon: '🧭', path: '/games/spatial', color: 'from-rose-500 to-pink-700' },
  { id: 'pathfinder', title: 'Pathfinder', description: 'Memorize the hidden path and trace it blindly.', icon: '🗺️', path: '/games/pathfinder', color: 'from-cyan-500 to-blue-700' },
  { id: 'balance', title: 'Perfect Balance', description: 'Math and speed. Balance the scales before time runs out!', icon: '⚖️', path: '/games/balance', color: 'from-amber-500 to-yellow-600' },
  { id: 'time', title: 'Time Sense', description: 'Stop the clock exactly on the target time. No peeking!', icon: '⏱️', path: '/games/time', color: 'from-violet-500 to-purple-700' },
  { id: 'rule', title: 'Rule Switcher', description: 'Sort the cards. The rules change silently. Adapt fast!', icon: '🔀', path: '/games/rule', color: 'from-pink-500 to-rose-700' },
  { id: 'mirror', title: 'Mirror Matrix', description: 'Draw the perfect mirrored reflection of the pattern.', icon: '🪞', path: '/games/mirror', color: 'from-blue-400 to-indigo-600' },
  { id: 'shell', title: 'Shell Game', description: 'Track the hidden treasures as they shuffle at high speed!', icon: '🎩', path: '/games/shell', color: 'from-amber-500 to-orange-700' }
];

  return (
    // Добавили transition-colors для плавного перетекания фона и dark:bg-slate-950
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 py-12 px-4 flex flex-col items-center justify-between relative">

      {/* Кнопка переключения темы (абсолютное позиционирование в правом верхнем углу) */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full bg-white dark:bg-slate-800 shadow-md text-xl hover:scale-110 active:scale-95 transition-all text-slate-800 dark:text-amber-300"
        aria-label="Toggle Dark Mode"
      >
        {isMounted ? (isDark ? '🌙' : '☀️') : '☀️'}
      </button>

      <div className="max-w-4xl w-full mt-8">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tight transition-colors">
            Micro<span className="text-indigo-600 dark:text-indigo-400">Games</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium transition-colors">micro-games for attention and memory training</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {games.map((game) => (
            <Link key={game.id} href={game.path} className="group block">
              {/* Добавили dark:shadow-none, чтобы тени не мешали в темной теме */}
              <div className={`relative h-full p-8 rounded-3xl bg-gradient-to-br ${game.color} text-white shadow-lg dark:shadow-none transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-2xl overflow-hidden border border-transparent dark:border-white/10`}>

                {isMounted && scores[game.id] && (
                  <div className="absolute top-6 right-6 bg-white/25 dark:bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-sm border border-white/20">
                    {scores[game.id]}
                  </div>
                )}

                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform origin-left">
                  {game.icon}
                </div>
                <h2 className="text-3xl font-bold mb-3">{game.title}</h2>
                <p className="text-white/90 font-medium mb-8 leading-relaxed max-w-[90%]">{game.description}</p>

                <div className="inline-flex items-center text-sm font-bold bg-white/20 dark:bg-black/20 px-5 py-2.5 rounded-full backdrop-blur-sm group-hover:bg-white/30 dark:group-hover:bg-black/30 transition-colors">
                  Play →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <footer className="w-full max-w-md text-center bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mt-auto transition-colors">
        <p className="text-slate-600 dark:text-slate-400 font-medium mb-4">
          Like our micro-games? Buy the developer a coffee! 👇
        </p>
        <a
          href="https://www.paypal.com/ncp/payment/MST9SR8Y4LXMY"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-amber-950 px-6 py-3 rounded-full font-black text-lg transition-all active:scale-95 shadow-md hover:shadow-lg w-full sm:w-auto"
        >
          ☕ Support the developer
        </a>
      </footer>
    </main>
  );
}