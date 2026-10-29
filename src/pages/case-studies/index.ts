import type { ComponentType } from 'react';
import type { CaseStudyMeta } from '@/components/case-study/CaseStudyLayout';
import BikeShareCaseStudy from './BikeShareCaseStudy';
import { bikeShareMeta } from './bikeShareMeta';
import EmotifCaseStudy from './EmotifCaseStudy';
import AnidojoCaseStudy from './AnidojoCaseStudy';
import DalGazetteCaseStudy from './DalGazetteCaseStudy';
import { anidojoMeta, dalGazetteMeta, emotifMeta } from './otherMeta';

export type CaseStudy = {
  meta: CaseStudyMeta;
  /** The write-up. `onOpenMoment` opens the project's live demo at a moment, if it has one. */
  Content: ComponentType<{ onOpenMoment?: (isoLocal: string, rideId?: string) => void }>;
};

/** Projects written up as long-form case studies, by project id. Others fall back to the standard write-up. */
export const caseStudies: Record<string, CaseStudy> = {
  'bike-share-toronto': { meta: bikeShareMeta, Content: BikeShareCaseStudy },
  emotif: { meta: emotifMeta, Content: EmotifCaseStudy },
  anidojo: { meta: anidojoMeta, Content: AnidojoCaseStudy },
  'dal gazette app': { meta: dalGazetteMeta, Content: DalGazetteCaseStudy },
};
