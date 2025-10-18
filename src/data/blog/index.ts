// Main blog data aggregator
import { BlogPost } from './types';
import { firstPosts } from './posts/first-post';
import { secondPosts } from './posts/2nd-post';

// Combine all blog posts
export const blogPosts: BlogPost[] = [
  ...firstPosts,
  ...secondPosts
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
