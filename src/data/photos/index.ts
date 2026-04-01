import { Photo } from './types';

// Import photos from assets folder
import photo1 from '@/assets/photos/73b4564c-b604-4f71-a0fb-f697914a6b90.jpg';
import photo2 from '@/assets/photos/C904134-R1-07-8A.jpg';
import photo3 from '@/assets/photos/C904134-R1-32-33A.jpg';
import photo4 from '@/assets/photos/C653795-R1-36-37.jpg';
import photo5 from '@/assets/photos/C653795-R1-23-24.jpg';
import photo6 from '@/assets/photos/C653795-R1-16-17.jpg';
import photo7 from '@/assets/photos/C651689-R1-13-15.jpg';
import photo8 from '@/assets/photos/C651688-R1-25-26.jpg';
import photo9 from '@/assets/photos/C651085-R1-12-13.jpg';
import photo10 from '@/assets/photos/C651084-R2-02-3.jpg';
import photo11 from '@/assets/photos/C492181-R2-25-25A.jpg';
import photo12 from '@/assets/photos/C459233-R1-02-0A.jpg';
import photo13 from '@/assets/photos/9976d7d7-8d12-42aa-b0c5-266df5417508.jpg';
import photo14 from '@/assets/photos/C459233-R3-19-17A.jpg';
import photo15 from '@/assets/photos/C489517-R1-18-20.jpg';
import photo16 from '@/assets/photos/C651688-R1-28-29.jpg';
import photo17 from '@/assets/photos/C653795-R1-32-33.jpg';
import photo18 from '@/assets/photos/C904134-R1-18-19A.jpg';
import photo19 from '@/assets/photos/C904134-R1-28-29A.jpg';


export const photos: Photo[] = [
  {
    id: 'photo-3',
    title: "Moi",
    //description: 'Optional description',
    image: photo3, // Use imported image for better bundling
    date: '2025-06-20',
    //location: 'Optional location',
   // tags: ['tag1', 'tag2'],
  },
  {
    id: 'photo-1',
    title: "Jasmine's graduation",
    //description: 'Optional description',
    image: photo1, // Use imported image for better bundling
    date: '2025-06-20',
    //location: 'Optional location',
    //tags: ['tag1', 'tag2'],
    aspectRatio: 'landscape',
  },
  {
    id: 'photo-2',
    title: "Lights in the house",
    //description: 'Optional description',
    image: photo2, // Use imported image for better bundling
    date: '2025-06-20',
    //location: 'Optional location',
   // tags: ['tag1', 'tag2'],
  },
  {
    id: 'photo-4',
    title: "Leo, my sweet Leo",
    //description: 'Optional description',
    image: photo4, // Use imported image for better bundling
    date: '2025-06-20',
    //location: 'Optional location',
   // tags: ['tag1', 'tag2'],
  },
  {
    id: 'photo-5',
    title: "Under the Expressway",
    //description: 'Optional description',
    image: photo5, // Use imported image for better bundling
    date: '2025-06-20',
    //location: 'Optional location',
   // tags: ['tag1', 'tag2'],
  },
  {
    id: 'photo-6',
    title: "Toronto Islands",
    //description: 'Optional description',
    image: photo6, // Use imported image for better bundling
    date: '2025-06-20',
    //location: 'Optional location',
   // tags: ['tag1', 'tag2'],
  },
  {
    id: 'photo-7',
    title: "Pizza! Pizza! Pizza!",
    //description: 'Optional description',
    image: photo7, // Use imported image for better bundling
    date: '2025-06-20',
    //location: 'Optional location',
   // tags: ['tag1', 'tag2'],
  },
  {
    id: 'photo-8',
    title: "DT Toronto",
    //description: 'Optional description',
    image: photo8, // Use imported image for better bundling
    date: '2025-06-20',
    //location: 'Optional location',
   // tags: ['tag1', 'tag2'],
  },
  {
    id: 'photo-9',
    title: "Lunenburg, Nova Scotia",
    //description: 'Optional description',
    image: photo9, // Use imported image for better bundling
    date: '2025-06-20',
    //location: 'Optional location',
   // tags: ['tag1', 'tag2'],
  },
  {
    id: 'photo-10',
    title: "A corner in Halifax",
    //description: 'Optional description',
    image: photo10, // Use imported image for better bundling
    date: '2025-06-20',
    //location: 'Optional location',
   // tags: ['tag1', 'tag2'],
  },
  {
    id: 'photo-11',
    title: "Another corner in Halifax",
    //description: 'Optional description',
    image: photo11, // Use imported image for better bundling
    date: '2025-06-20',
    //location: 'Optional location',
   // tags: ['tag1', 'tag2'],
  },
  {
    id: 'photo-12',
    title: "Ezza and Kashfy",
    //description: 'Optional description',
    image: photo12, // Use imported image for better bundling
    date: '2025-06-20',
    //location: 'Optional location',
   // tags: ['tag1', 'tag2'],
  },
  {
    id: 'photo-13',
    title: "Spider-Man Meme ofc",
    image: photo13,
    date: '2025-06-20',
  },
  {
    id: 'photo-14',
    title: "Love a good Fair",
    image: photo14,
    date: '2025-06-20',
  },
  {
    id: 'photo-15',
    title: "A must to go up Halifax's blue wave",
    image: photo15,
    date: '2025-06-20',
  },
  {
    id: 'photo-16',
    title: "I love you Toronto",
    image: photo16,
    date: '2025-06-20',
  },
  {
    id: 'photo-17',
    title: "Ardmore's",
    image: photo17,
    date: '2025-06-20',
  },
  {
    id: 'photo-18',
    title: "Sweet, sweet Rameen",
    image: photo18,
    date: '2025-06-20',
  },
  {
    id: 'photo-19',
    title: "Kaitlyn and I at her birthday. I look good here lol",
    image: photo19,
    date: '2025-06-20',
  },
  // Add more photos here:
  // {
  //   id: 'photo-2',
  //   title: 'Another Photo',
  //   description: 'Description',
  //   image: photo2,
  //   date: '2024-12-21',
  //   location: 'Location',
  //   tags: ['tag1'],
  //   aspectRatio: 'landscape' // or 'portrait' or 'square'
  // },
];

// Optional: Group photos by year
export const photosByYear = photos.reduce((acc, photo) => {
  const year = new Date(photo.date).getFullYear();
  if (!acc[year]) acc[year] = [];
  acc[year].push(photo);
  return acc;
}, {} as Record<number, Photo[]>);

// Export types
export type { Photo } from './types';

