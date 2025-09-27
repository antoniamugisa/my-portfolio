export interface MediaItem {
  id: string;
  title: string;
  type: 'book' | 'film' | 'tv' | 'anime' | 'game' | 'music';
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
      },
      {
        id: 'blonde',
        title: 'Blonde',
        type: 'music',
        status: 'completed',
        description: 'Album',
        author: 'Frank Ocean',
        year: 2016,
        rating: 0,
        notes: '',
        genre: ['R&B', 'Alternative R&B'],
        image: ''
      },
      {
        id: 'currents',
        title: 'Currents',
        type: 'music',
        status: 'currently-consuming',
        description: 'Album',
        author: 'Tame Impala',
        year: 2015,
        rating: 0,
        notes: '',
        genre: ['Psychedelic Pop', 'Indie Rock'],
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
    case 'anime':
      return '🎌';
    case 'game':
      return '🎮';
    case 'music':
      return '🎵';
    default:
      return '📄';
  }
};
