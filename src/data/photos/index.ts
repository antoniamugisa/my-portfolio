import { Photo } from './types';

// Grid thumbs only (~332KB total). Full lightbox images load on demand.
import thumb1 from '@/assets/photos/thumbs/73b4564c-b604-4f71-a0fb-f697914a6b90.webp';
import thumb2 from '@/assets/photos/thumbs/C904134-R1-07-8A.webp';
import thumb3 from '@/assets/photos/thumbs/C904134-R1-32-33A.webp';
import thumb4 from '@/assets/photos/thumbs/C653795-R1-36-37.webp';
import thumb5 from '@/assets/photos/thumbs/C653795-R1-23-24.webp';
import thumb6 from '@/assets/photos/thumbs/C653795-R1-16-17.webp';
import thumb7 from '@/assets/photos/thumbs/C651689-R1-13-15.webp';
import thumb8 from '@/assets/photos/thumbs/C651688-R1-25-26.webp';
import thumb9 from '@/assets/photos/thumbs/C651085-R1-12-13.webp';
import thumb10 from '@/assets/photos/thumbs/C651084-R2-02-3.webp';
import thumb11 from '@/assets/photos/thumbs/C492181-R2-25-25A.webp';
import thumb12 from '@/assets/photos/thumbs/C459233-R1-02-0A.webp';
import thumb13 from '@/assets/photos/thumbs/9976d7d7-8d12-42aa-b0c5-266df5417508.webp';
import thumb14 from '@/assets/photos/thumbs/C459233-R3-19-17A.webp';
import thumb15 from '@/assets/photos/thumbs/C489517-R1-18-20.webp';
import thumb16 from '@/assets/photos/thumbs/C651688-R1-28-29.webp';
import thumb17 from '@/assets/photos/thumbs/C653795-R1-32-33.webp';
import thumb18 from '@/assets/photos/thumbs/C904134-R1-18-19A.webp';
import thumb19 from '@/assets/photos/thumbs/C904134-R1-28-29A.webp';

/** Lazy loaders for full-size lightbox WebPs (not in initial /photos chunk). */
const fullLoaders = import.meta.glob<string>('../../assets/photos/*.webp', {
  import: 'default',
});

function loadFull(filename: string): () => Promise<string> {
  const key = `../../assets/photos/${filename}`;
  const loader = fullLoaders[key];
  if (!loader) {
    return async () => '';
  }
  return () => loader();
}

export const photos: Photo[] = [
  {
    id: 'photo-3',
    title: 'Moi',
    thumb: thumb3,
    loadFull: loadFull('C904134-R1-32-33A.webp'),
    date: '2025-06-20',
  },
  {
    id: 'photo-1',
    title: "Jasmine's graduation",
    thumb: thumb1,
    loadFull: loadFull('73b4564c-b604-4f71-a0fb-f697914a6b90.webp'),
    date: '2025-06-20',
    aspectRatio: 'landscape',
  },
  {
    id: 'photo-2',
    title: 'Lights in the house',
    thumb: thumb2,
    loadFull: loadFull('C904134-R1-07-8A.webp'),
    date: '2025-06-20',
  },
  {
    id: 'photo-4',
    title: 'Leo, my sweet Leo',
    thumb: thumb4,
    loadFull: loadFull('C653795-R1-36-37.webp'),
    date: '2025-06-20',
  },
  {
    id: 'photo-5',
    title: 'Under the Expressway',
    thumb: thumb5,
    loadFull: loadFull('C653795-R1-23-24.webp'),
    date: '2025-06-20',
  },
  {
    id: 'photo-6',
    title: 'Toronto Islands',
    thumb: thumb6,
    loadFull: loadFull('C653795-R1-16-17.webp'),
    date: '2025-06-20',
  },
  {
    id: 'photo-7',
    title: 'Pizza! Pizza! Pizza!',
    thumb: thumb7,
    loadFull: loadFull('C651689-R1-13-15.webp'),
    date: '2025-06-20',
  },
  {
    id: 'photo-8',
    title: 'DT Toronto',
    thumb: thumb8,
    loadFull: loadFull('C651688-R1-25-26.webp'),
    date: '2025-06-20',
  },
  {
    id: 'photo-9',
    title: 'Lunenburg, Nova Scotia',
    thumb: thumb9,
    loadFull: loadFull('C651085-R1-12-13.webp'),
    date: '2025-06-20',
  },
  {
    id: 'photo-10',
    title: 'A corner in Halifax',
    thumb: thumb10,
    loadFull: loadFull('C651084-R2-02-3.webp'),
    date: '2025-06-20',
  },
  {
    id: 'photo-11',
    title: 'Another corner in Halifax',
    thumb: thumb11,
    loadFull: loadFull('C492181-R2-25-25A.webp'),
    date: '2025-06-20',
  },
  {
    id: 'photo-12',
    title: 'Ezza and Kashfy',
    thumb: thumb12,
    loadFull: loadFull('C459233-R1-02-0A.webp'),
    date: '2025-06-20',
  },
  {
    id: 'photo-13',
    title: 'Spider-Man Meme ofc',
    thumb: thumb13,
    loadFull: loadFull('9976d7d7-8d12-42aa-b0c5-266df5417508.webp'),
    date: '2025-06-20',
  },
  {
    id: 'photo-14',
    title: 'Love a good Fair',
    thumb: thumb14,
    loadFull: loadFull('C459233-R3-19-17A.webp'),
    date: '2025-06-20',
  },
  {
    id: 'photo-15',
    title: "A must to go up Halifax's blue wave",
    thumb: thumb15,
    loadFull: loadFull('C489517-R1-18-20.webp'),
    date: '2025-06-20',
  },
  {
    id: 'photo-16',
    title: 'I love you Toronto',
    thumb: thumb16,
    loadFull: loadFull('C651688-R1-28-29.webp'),
    date: '2025-06-20',
  },
  {
    id: 'photo-17',
    title: "Ardmore's",
    thumb: thumb17,
    loadFull: loadFull('C653795-R1-32-33.webp'),
    date: '2025-06-20',
  },
  {
    id: 'photo-18',
    title: 'Sweet, sweet Rameen',
    thumb: thumb18,
    loadFull: loadFull('C904134-R1-18-19A.webp'),
    date: '2025-06-20',
  },
  {
    id: 'photo-19',
    title: 'Kaitlyn and I at her birthday. I look good here lol',
    thumb: thumb19,
    loadFull: loadFull('C904134-R1-28-29A.webp'),
    date: '2025-06-20',
  },
];

export const photosByYear = photos.reduce((acc, photo) => {
  const year = new Date(photo.date).getFullYear();
  if (!acc[year]) acc[year] = [];
  acc[year].push(photo);
  return acc;
}, {} as Record<number, Photo[]>);

export type { Photo } from './types';
