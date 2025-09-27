// Main blog data aggregator
import { BlogPost } from './types';
import { aiPosts } from './posts/ai-posts';
import { developmentPosts } from './posts/development-posts';
import { careerPosts } from './posts/career-posts';

// Combine all blog posts
export const blogPosts: BlogPost[] = [
  ...aiPosts,
  ...developmentPosts,
  ...careerPosts,
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
