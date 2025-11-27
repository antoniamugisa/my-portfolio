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
        url: 'https://www.crunchyroll.com/series/GRDV0019R/jujutsu-kaisen',
      },
      {
        id: 'abundant-intelligence',
        title: 'Abundant Intelligence',
        type: 'book',
        description: 'Personal Blog',
        author: 'Sam Altman',
        url: 'https://blog.samaltman.com/abundant-intelligence',
      },
      {
        id: 'wicked for good',
        title: 'Wicked for Good',
        type: 'film',
        description: 'Movie',
        author: 'Jon M.Chu',
        url: 'https://www.wickedmovie.com/',
      },
      {
        id: 'stranger-things',
        title: 'Stranger Things Season 5',
        type: 'tv',
        description: 'TV Series',
        author: 'The Duffer Brothers',
        url: 'https://www.netflix.com/title/80057281',
      },
      {
        id: 'frankenstein',
        title: 'Frankenstein',
        type: 'film',
        description: 'Movie',
        author: 'Guillermo del Toro',
        url: 'https://www.netflix.com/title/81507921',
      },
      {
        id: 'demon-slayer',
        title: 'Demon Slayer',
        type: 'anime',
        description: 'Anime Series',
        author: 'Koyoharu Gotouge',
        url: 'https://www.netflix.com/title/81091393',
      },
      {
        id: 'infinity-castle',
        title: 'Demon Slayer: Kimetsu no Yaiba Infinity Castle',
        type: 'film',
        description: 'Movie',
        author: 'Haruo Sotozaki',
        url: 'https://www.crunchyroll.com/series/G8DHV7809/demon-slayer-kimetsu-no-yaiba-infinity-castle',
      },
      {
        id: 'whos-the-clown',
        title: "Who's the Clown?",
        type: 'music',
        description: 'Album',
        author: 'Audrey Hobart',
        url: 'https://open.spotify.com/album/6unMpOoIJqsLxuoTEFqdfP',
      },
      {
        id: 'the-art-of-loving',
        title: 'The Art of Loving',
        type: 'music',
        description: 'Album',
        author: 'Olivia Dean',
        url: 'https://open.spotify.com/album/0l8zYqoUeBYg47Gmevq9HZ',
      }
    ]
  }
];


