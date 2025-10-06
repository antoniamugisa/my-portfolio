// Export all projects
export { emotifProject } from './emotif';
export { anidojoProject } from './anidojo';
export { socialUpProject } from './socialUp';
export { dalGazetteProject } from './dalGazette';

// Import all projects for the projects array
import { emotifProject } from './emotif';
import { anidojoProject } from './anidojo';
import { socialUpProject } from './socialUp';
import { dalGazetteProject } from './dalGazette';

// Export the projects array
export const projects = [
  emotifProject,
  anidojoProject,
  socialUpProject,
  dalGazetteProject
];

// Export project types for TypeScript
export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  category: string;
  demoUrl: string;
  githubUrl: string;
  featured: boolean;
  date: string;
  tags: string[];
  status: 'Completed' | 'Ongoing' | 'Planned';
  longDescription?: string;
  keyFeatures?: string[];
  challenges?: string[];
  learnings?: string[];
  futureImprovements?: string[];
}
