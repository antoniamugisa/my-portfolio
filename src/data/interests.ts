export interface MediaItem {
  id: string;
  title: string;
  type: 'book' | 'film' | 'tv' | 'essay' | 'anime' | 'game';
  status: 'currently-consuming' | 'completed' | 'planning-to-consume';
  description: string;
  image?: string;
  author?: string;
  year?: number;
  rating?: number;
  notes?: string;
  genre?: string[];
  platform?: string;
  url?: string;
}

export interface InterestCategory {
  id: string;
  title: string;
  description: string;
  items: MediaItem[];
}

export const interestsData: InterestCategory[] = [
  {
    id: 'all',
    title: 'All',
    description: 'Everything I\'m currently consuming',
    items: [
      {
        id: 'the-bear',
        title: 'The Bear',
        type: 'tv',
        status: 'currently-consuming',
        description: 'TV Show',
        author: '',
        year: 2022,
        rating: 0,
        notes: '',
        genre: [],
        image: ''
      },
      {
        id: 'atomic-habits',
        title: 'Atomic Habits',
        type: 'book',
        status: 'completed',
        description: 'Book',
        author: 'James Clear',
        year: 2018,
        rating: 0,
        notes: '',
        genre: [],
        image: ''
      },
      {
        id: 'do-hard-things',
        title: 'Do Hard Things',
        type: 'essay',
        status: 'completed',
        description: 'Video',
        author: 'Casey Neistat',
        year: 2023,
        rating: 0,
        notes: '',
        genre: [],
        image: ''
      },
      {
        id: 'interstellar',
        title: 'Interstellar',
        type: 'film',
        status: 'completed',
        description: 'Movie',
        author: 'Christopher Nolan',
        year: 2014,
        rating: 0,
        notes: '',
        genre: [],
        image: ''
      },
      {
        id: 'meditations',
        title: 'Meditations',
        type: 'book',
        status: 'currently-consuming',
        description: 'Book',
        author: 'Marcus Aurelius',
        year: 180,
        rating: 0,
        notes: '',
        genre: [],
        image: ''
      },
      {
        id: 'how-to-do-philosophy',
        title: 'How to Do Philosophy',
        type: 'essay',
        status: 'completed',
        description: 'Essay',
        author: 'Paul Graham',
        year: 2023,
        rating: 0,
        notes: '',
        genre: [],
        image: ''
      },
      {
        id: 'pursuit-of-happyness',
        title: 'The Pursuit of Happyness',
        type: 'film',
        status: 'completed',
        description: 'Movie',
        author: 'Gabriele Muccino',
        year: 2006,
        rating: 0,
        notes: '',
        genre: [],
        image: ''
      },
      {
        id: 'common-toad',
        title: 'Some Thoughts on the Common Toad',
        type: 'essay',
        status: 'completed',
        description: 'Essay',
        author: 'George Orwell',
        year: 1946,
        rating: 0,
        notes: '',
        genre: [],
        image: ''
      },
      {
        id: 'demon-slayer',
        title: 'Demon Slayer',
        type: 'anime',
        status: 'completed',
        description: 'Anime Series',
        author: 'Koyoharu Gotouge',
        year: 2019,
        rating: 0,
        notes: '',
        genre: [],
        image: ''
      },
      {
        id: 'inception',
        title: 'Inception',
        type: 'film',
        status: 'completed',
        description: 'Movie',
        author: 'Christopher Nolan',
        year: 2010,
        rating: 0,
        notes: '',
        genre: [],
        image: ''
      }
    ]
  }
];

export const getStatusColor = (status: MediaItem['status']) => {
  switch (status) {
    case 'currently-consuming':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'planning-to-consume':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

export const getTypeIcon = (type: MediaItem['type']) => {
  switch (type) {
    case 'book':
      return '📚';
    case 'film':
      return '🎬';
    case 'tv':
      return '📺';
    case 'essay':
      return '📝';
    case 'anime':
      return '🎌';
    case 'game':
      return '🎮';
    default:
      return '📄';
  }
};
