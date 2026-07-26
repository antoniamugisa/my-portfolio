// Export all projects
export { emotifProject } from './emotif';
export { anidojoProject } from './anidojo';
export { dalGazetteProject } from './dalGazette';
export { bikeShareTorontoProject } from './bikeShareToronto';

// Import all projects for the projects array
import { emotifProject } from './emotif';
import { anidojoProject } from './anidojo';
import { dalGazetteProject } from './dalGazette';
import { bikeShareTorontoProject } from './bikeShareToronto';

// Export the projects array
export const projects = [
  emotifProject,
  anidojoProject,
  dalGazetteProject,
  bikeShareTorontoProject,
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
  keyFeatures?: string;
  challenges?: string;
  learnings?: string;
  futureImprovements?: string;
  teamImage?: string;
  teamCaption?: string;
  demoVideo?: string;
}
