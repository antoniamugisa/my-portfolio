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
        id: 'jujutsu-kaisen',
        title: 'Jujutsu Kaisen',
        type: 'tv',
        description: 'Anime Series',
        author: 'Gege Akutami',
      },
      {
        id: 'abundant-intelligence',
        title: 'Abundant Intelligence',
        type: 'book',
        description: 'Personal Blog',
        author: 'Sam Altman',
      },
      {
        id: 'wicked for good',
        title: 'Wicked for Good',
        type: 'film',
        description: 'Movie',
        author: 'Jon M.Chu',
      },
      {
        id: 'stranger-things',
        title: 'Stranger Things Season 4',
        type: 'tv',
        description: 'TV Series',
        author: 'The Duffer Brothers',
      },
      {
        id: 'frankenstein',
        title: 'Frankenstein',
        type: 'film',
        description: 'Movie',
        author: 'Guillermo del Toro',
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
        id: 'whos-the-clown',
        title: "Who's the Clown?",
        type: 'music',
        description: 'Album',
        author: 'Audrey Hobart',
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


