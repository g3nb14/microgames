export interface Game {
  id: string;
  title: string;
  description: string;
  slug: string; // путь в URL
  icon: string;
  color: string;
}

export const GAMES: Game[] = [
  {
    id: '1',
    title: 'Пятнашки',
    description: 'Классическая головоломка с числами',
    slug: 'tiles',
    icon: '🧩',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: '2',
    title: 'Мемори',
    description: 'Найди все пары одинаковых карточек',
    slug: 'memory',
    icon: '🧠',
    color: 'from-pink-500 to-rose-600'
  }
];