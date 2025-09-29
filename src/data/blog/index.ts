// Main blog data aggregator
import { BlogPost } from './types';
import { firstPosts } from './posts/first-post';

// Combine all blog posts
export const blogPosts: BlogPost[] = [
  ...firstPosts
];

// Blog categories
export const blogCategories = [
  'All',
  'AI & Machine Learning',
  'Development',
  'Career & Growth',
  'Technology',
  'Personal'
];

// Export types
export type { BlogPost } from './types';
