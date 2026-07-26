export interface MediaItem {
  id: string;
  title: string;
  type: 'book' | 'film' | 'tv' | 'anime' | 'game' | 'music';
  /** Short label shown in UI context, e.g. Movie, Album, Essay */
  description: string;
  image?: string;
  author?: string;
  platform?: string;
  url?: string;
}

/** Color-coded section titles (chip style) + which media types they include */
export const genreSections = [
  {
    id: 'film',
    label: 'Movies',
    singular: 'movie',
    plural: 'movies',
    types: ['film'] as const,
  },
  {
    id: 'tv',
    label: 'Shows',
    singular: 'show',
    plural: 'shows',
    types: ['tv', 'anime'] as const,
  },
  {
    id: 'music',
    label: 'Albums',
    singular: 'album',
    plural: 'albums',
    types: ['music'] as const,
  },
  {
    id: 'game',
    label: 'Games',
    singular: 'game',
    plural: 'games',
    types: ['game'] as const,
  },
  {
    id: 'book',
    label: 'Reads',
    singular: 'read',
    plural: 'reads',
    types: ['book'] as const,
  },
] as const;

export type GenreSectionId = (typeof genreSections)[number]['id'] | 'all';

/** Full Recs history (every item that has appeared), with links where known. Add `image` paths under /images/recs/ when ready. */
export const mediaItems: MediaItem[] = [
  // —— Film ——
  {
    id: 'no-other-choice',
    title: 'No Other Choice',
    type: 'film',
    description: 'Movie',
    author: 'Park Chan-wook',
    url: 'https://www.neonrated.com/film/no-other-choice',
    image: '/images/recs/no-other-choice.png',
  },
  {
    id: 'the-bodyguard',
    title: 'The Bodyguard',
    type: 'film',
    description: 'Movie',
    author: 'Mick Jackson',
    url: 'https://www.warnerbros.com/movies/bodyguard',
    image: '/images/recs/the-bodyguard.png',
  },
  {
    id: 'eternity',
    title: 'Eternity',
    type: 'film',
    description: 'Movie',
    author: 'David Freyne',
    url: 'https://a24films.com/films/eternity',
    image: '/images/recs/eternity.png',
  },
  {
    id: 'wicked-for-good',
    title: 'Wicked for Good',
    type: 'film',
    description: 'Movie',
    author: 'Jon M. Chu',
    url: 'https://www.wickedmovie.com/',
    image: '/images/recs/wicked-for-good.png',
  },
  {
    id: 'frankenstein',
    title: 'Frankenstein',
    type: 'film',
    description: 'Movie',
    author: 'Guillermo del Toro',
    url: 'https://www.netflix.com/title/81507921',
    image: '/images/recs/frankenstein.png',
  },
  {
    id: 'thunderbolts',
    title: 'Thunderbolts',
    type: 'film',
    description: 'Movie',
    author: 'Jake Schreier',
    url: 'https://www.marvel.com/movies/thunderbolts',
    image: '/images/recs/thunderbolts.png',
  },
  {
    id: 'superman',
    title: 'Superman',
    type: 'film',
    description: 'Movie',
    author: 'James Gunn',
    url: 'https://www.dc.com/movies/superman-2025',
    image: '/images/recs/superman.png',
  },
  {
    id: 'infinity-castle',
    title: 'Demon Slayer: Kimetsu no Yaiba Infinity Castle',
    type: 'film',
    description: 'Movie',
    author: 'Haruo Sotozaki',
    url: 'https://www.crunchyroll.com/series/GY5P48XEY/demon-slayer-kimetsu-no-yaiba',
    image: '/images/recs/infinity-castle.png',
  },
  {
    id: 'interstellar',
    title: 'Interstellar',
    type: 'film',
    description: 'Movie',
    author: 'Christopher Nolan',
    url: 'https://www.legendary.com/film/interstellar/',
    image: '/images/recs/interstellar.png',
  },
  {
    id: 'inception',
    title: 'Inception',
    type: 'film',
    description: 'Movie',
    author: 'Christopher Nolan',
    url: 'https://www.warnerbros.com/movies/inception',
    image: '/images/recs/inception.png',
  },

  // —— Series ——
  {
    id: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    type: 'tv',
    description: 'Anime Series',
    author: 'Gege Akutami',
    url: 'https://www.crunchyroll.com/series/GRDV0019R/jujutsu-kaisen',
    image: '/images/recs/jujutsu-kaisen.png',
  },
  {
    id: 'industry',
    title: 'Industry',
    type: 'tv',
    description: 'TV Series',
    author: 'Mikey Down, Konrad Kay',
    url: 'https://www.hbomax.com/shows/industry/9e51c88c-7a28-40ee-8269-e16572e02a07',
    image: '/images/recs/industry.png',
  },
  {
    id: 'stranger-things',
    title: 'Stranger Things',
    type: 'tv',
    description: 'TV Series',
    author: 'The Duffer Brothers',
    url: 'https://www.netflix.com/title/80057281',
    image: '/images/recs/stranger-things.png',
  },
  {
    id: 'one-piece',
    title: 'One Piece',
    type: 'tv',
    description: 'Anime Series',
    author: 'Eiichiro Oda',
    url: 'https://www.crunchyroll.com/series/GRMG8ZQZR/one-piece',
    image: '/images/recs/one-piece.png',
  },
  {
    id: 'the-bear',
    title: 'The Bear',
    type: 'tv',
    description: 'TV Series',
    author: 'Christopher Storer',
    url: 'https://www.fxnetworks.com/shows/the-bear',
    image: '/images/recs/the-bear.png',
  },
  {
    id: 'demon-slayer',
    title: 'Demon Slayer',
    type: 'anime',
    description: 'Anime Series',
    author: 'Koyoharu Gotouge',
    url: 'https://www.netflix.com/title/81091393',
    image: '/images/recs/demon-slayer.png',
  },

  // —— Music ——
  {
    id: 'this-is-for',
    title: 'THIS IS FOR',
    type: 'music',
    description: 'Album',
    author: 'TWICE',
    url: 'https://open.spotify.com/album/02dUOPB3MtmV5fawzaZiq6?si=RBNpM2eURtaDntVrIbQuLQ',
    image: '/images/recs/this-is-for.png',
  },
  {
    id: 'you-seem-pretty-sad',
    title: 'you seem pretty sad for a girl so in love',
    type: 'music',
    description: 'Album',
    author: 'Olivia Rodrigo',
    url: 'https://open.spotify.com/album/3WZZF72ihlKPZBS4zSsNHl?si=BBijLQmKR0Oid14xkS5IEA',
    image: '/images/recs/you-seem-pretty-sad.png',
  },
  {
    id: 'rosie',
    title: 'rosie',
    type: 'music',
    description: 'Album',
    author: 'ROSÉ',
    url: 'https://open.spotify.com/album/7kFyd5oyJdVX2pIi6P4iHE?si=9VYBnDHASXCdVBMFz4taGA',
    image: '/images/recs/rosie.png',
  },
  {
    id: 'bite-me',
    title: 'Bite Me',
    type: 'music',
    description: 'Album',
    author: 'Reneé Rapp',
    url: 'https://open.spotify.com/album/6ULnaZahd0zTGVUBVQO6mN?si=u5EQGGUnTAy3J683nYsGPw',
    image: '/images/recs/bite-me.png',
  },
  {
    id: 'the-art-of-loving',
    title: 'The Art of Loving',
    type: 'music',
    description: 'Album',
    author: 'Olivia Dean',
    url: 'https://open.spotify.com/album/0l8zYqoUeBYg47Gmevq9HZ?si=9rZ7g8KkQSOx2bwvrV7Fdg',
    image: '/images/recs/the-art-of-loving.png',
  },
  {
    id: 'octane',
    title: 'Octane',
    type: 'music',
    description: 'Album',
    author: 'Don Toliver',
    url: 'https://open.spotify.com/album/131x9G87mD0hP0hGZc9qYN?si=S2NLDTsvRNWfRS00LbByoQ',
    image: '/images/recs/octane.png',
  },

  // —— Games ——
  {
    id: 'ghost-of-tsushima',
    title: 'Ghost of Tsushima',
    type: 'game',
    description: 'Game',
    author: 'Sucker Punch',
    url: 'https://www.playstation.com/en-us/games/ghost-of-tsushima/',
    image: '/images/recs/ghost-of-tsushima.png',
  },
  {
    id: 'the-last-of-us-part-1',
    title: 'The Last of Us Part I',
    type: 'game',
    description: 'Game',
    author: 'Naughty Dog',
    url: 'https://www.playstation.com/en-us/games/the-last-of-us-part-i/',
    image: '/images/recs/the-last-of-us-part-1.png',
  },
  {
    id: 'the-last-of-us-part-2',
    title: 'The Last of Us Part II',
    type: 'game',
    description: 'Game',
    author: 'Naughty Dog',
    url: 'https://www.playstation.com/en-us/games/the-last-of-us-part-ii/',
    image: '/images/recs/the-last-of-us-part-2.png',
  },
  {
    id: 'god-of-war',
    title: 'God of War',
    type: 'game',
    description: 'Game',
    author: 'Santa Monica Studio',
    url: 'https://www.playstation.com/en-us/god-of-war/',
    image: '/images/recs/god-of-war.png',
  },

  // —— Essays / books / blogs (type book) ——
  {
    id: 'intimacy-of-inconvenience',
    title: 'The Intimacy of Inconvenience',
    type: 'book',
    description: 'Essay',
    author: 'Emilie Mendham',
    url: 'https://emiliemendham.substack.com/p/the-intimacy-of-inconvenience',
    image: '/images/recs/intimacy-of-inconvenience.png?v=2',
  },
  {
    id: 'whats-meant-for-you',
    title: "what's meant for you, will never pass you by",
    type: 'book',
    description: 'Essay',
    author: 'Daphne',
    url: 'https://coldmemories.substack.com/p/whats-meant-for-you-will-never-pass',
    image: '/images/recs/whats-meant-for-you.png?v=2',
  },
  {
    id: 'mouths-of-rain',
    title: 'Mouths of Rain',
    type: 'book',
    description: 'Book',
    author: 'Briona Simone Jones',
    url: 'https://thenewpress.org/books/mouths-of-rain/',
    image: '/images/recs/mouths-of-rain.png',
  },
];

/** @deprecated Prefer mediaItems + genreSections */
export const interestsData = [
  {
    id: 'all',
    title: 'All',
    description: "Everything I'm currently consuming",
    items: mediaItems,
  },
];

export function getTypeHighlight(type: MediaItem['type']): string {
  switch (type) {
    case 'book':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'film':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'tv':
    case 'anime':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'game':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'music':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}

export function getSectionHighlight(sectionId: (typeof genreSections)[number]['id']): string {
  switch (sectionId) {
    case 'film':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'tv':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'music':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    case 'game':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'book':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}
