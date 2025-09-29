import { BlogPost } from '../types';
import firstPostImage from '@/assets/firstPost.jpg';

export const firstPosts: BlogPost[] = [
  {
    id: "first-post",
    title: "endings are just beginnings",
    date: "2024-09-29",
    category: "self",
    description: "change and i do not go well together",
    content: `# 

i have realised i never do well with endings. 

this past year has been an absolute rollercoaster of emotions and i have had to face a lot of things i have never faced before. after packing my things, saying (temporary) goodbyes to my friends and hopping on a plane to finally see my family for the first time in 4 years

`,
    image: firstPostImage,
    readTime: 8,
    author: "Antonia Mugisa",
    tags: ["personal", "lessons"]
  }
];