import type { ComponentType } from 'react';
import type { CaseStudyMeta } from '@/components/case-study/CaseStudyLayout';
import BikeShareCaseStudy from './BikeShareCaseStudy';
import { bikeShareMeta } from './bikeShareMeta';

export type CaseStudy = {
  meta: CaseStudyMeta;
  /** The write-up. `onOpenMoment` opens the project's live demo at a moment, if it has one. */
  Content: ComponentType<{ onOpenMoment?: (isoLocal: string) => void }>;
};

/** Projects written up as long-form case studies, by project id. Others use the standard page. */
export const caseStudies: Record<string, CaseStudy> = {
  'bike-share-toronto': { meta: bikeShareMeta, Content: BikeShareCaseStudy },
};
