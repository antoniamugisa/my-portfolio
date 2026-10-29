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
export const projects: Project[] = [
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
  /** How the project is built; shown as "How It Works" after Key Features. */
  architecture?: string;
  challenges?: string;
  learnings?: string;
  futureImprovements?: string;
  teamImage?: string;
  teamCaption?: string;
  demoVideo?: string;
  /** Text for an external demo link, when it isn't a live app (e.g. "Devpost"). Default "Live Demo". */
  demoLabel?: string;
  /** Short silent loop for the top of the case study, when the preview clip doesn't fit there. */
  heroVideo?: string;
  /** Short looping preview shown on the projects grid thumbnail */
  thumbnailVideo?: string;
  /** Background image behind an inset thumbnail video */
  thumbnailBackground?: string;
  /** How the thumbnail video fits the card. Default cover. */
  thumbnailFit?: 'cover' | 'contain';
}
