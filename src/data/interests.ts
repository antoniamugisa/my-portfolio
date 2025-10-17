export interface MediaItem {
  id: string;
  title: string;
  type: 'book' | 'film' | 'tv' | 'anime' | 'game' | 'music';
  description: string;
  image?: string;
  author?: string;
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
        id: 'one-piece',
        title: 'One Piece',
        type: 'tv',
        description: 'Anime Series',
        author: 'Eiichiro Oda',
      },
      {
        id: 'abundant-intelligence',
        title: 'Abundant Intelligence',
        type: 'book',
        description: 'Personal Blog',
        author: 'Sam Altman',
      },
      {
        id: 'thunderbolts',
        title: 'Thunderbolts',
        type: 'film',
        description: 'Movie',
        author: 'Jake Shreier',
      },
      {
        id: 'intimacy-of-inconvenience',
        title: 'The Intimacy of Inconvenience',
        type: 'book',
        description: 'Substack Essay',
        author: 'Emilie Mendham',
      },
      {
        id: 'superman',
        title: 'Superman',
        type: 'film',
        description: 'Movie',
        author: 'James Gunn ',
      },
      {
        id: 'demon-slayer',
        title: 'Demon Slayer',
        type: 'anime',
        description: 'Anime Series',
        author: 'Koyoharu Gotouge',
      },
      {
        id: 'infinity-castle',
        title: 'Demon Slayer: Kimetsu no Yaiba Infinity Castle',
        type: 'film',
        description: 'Movie',
        author: 'Haruo Sotozaki',
      },
      {
        id: 'bite-me',
        title: 'Bite Me',
        type: 'music',
        description: 'Album',
        author: 'Reneé Rapp',
      },
      {
        id: 'the-art-of-loving',
        title: 'The Art of Loving',
        type: 'music',
        description: 'Album',
        author: 'Olivia Dean',
      }
    ]
  }
];


