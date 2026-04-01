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
        id: 'octane',
        title: 'Octane',
        type: 'music',
        description: 'Album',
        author: 'Don Toliver',
        url: 'https://open.spotify.com/album/131x9G87mD0hP0hGZc9qYN?si=5uGkYHSgRU6-1A-I5QH39g',
      },
      {
        id: 'no other choice',
        title: 'No Other Choice',
        type: 'film',
        description: 'Movie',
        author: 'Park Chan-wook',
        url: 'https://www.neonrated.com/film/no-other-choice',
      },
      {
        id: 'industry',
        title: 'Industry',
        type: 'tv',
        description: 'TV Series',
        author: 'Mikey Down, Konrad Cay',
        url: 'https://www.hbomax.com/shows/industry/9e51c88c-7a28-40ee-8269-e16572e02a07',
      },
      {
        id: 'the-bodyguard',
        title: 'The Bodyguard',
        type: 'film',
        description: 'Movie',
        author: 'Mick Jackson',
        url: 'https://www.warnerbros.com/movies/bodyguard',
      },
      {
        id: 'ghost-of-tsushima',
        title: 'Ghost of Tsushima',
        type: 'game',
        description: 'Game',
        author: 'Sucker Punch',
        url: 'https://www.playstation.com/en-us/games/ghost-of-tsushima/',
      },
      {
        id: 'shit-i-think-my-prefrontal-cortex-just-developed',
        title: 'Shit, I think my prefrontal cortex just developed',
        type: 'book',
        description: 'Essay',
        author: 'Emilie Mendham',
        url: 'https://emiliemendham.substack.com/',
      },
      {
        id: 'eternity',
        title: 'Eternity',
        type: 'film',
        description: 'Movie',
        author: 'David Freyne',
        url: 'https://a24films.com/films/eternity',
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


