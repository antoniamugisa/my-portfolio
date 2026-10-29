import type { Project } from '@/data/projects';
import type { CaseStudyMeta } from '@/components/case-study/CaseStudyLayout';
import { CaseHeading, Figure, P } from '@/components/case-study/CaseStudyText';

/** Splits a template-literal description into trimmed paragraphs. */
function paragraphs(text?: string): string[] {
  return (text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

/** Role / timeline / stack / overview for a project without a hand-written case study. */
export function standardMeta(project: Project): CaseStudyMeta {
  const when = new Date(project.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const [overview] = paragraphs(project.longDescription);
  return {
    timeline: project.status === 'Ongoing' ? `${when} – present` : when,
    stack: project.technologies,
    overview: overview ?? project.description,
  };
}

const SECTIONS: { key: keyof Project; id: string; title: string }[] = [
  { key: 'keyFeatures', id: 'key-features', title: 'Key Features' },
  { key: 'architecture', id: 'how-it-works', title: 'How It Works' },
  { key: 'challenges', id: 'challenges', title: 'Challenges' },
  { key: 'learnings', id: 'what-i-learned', title: 'What I Learned' },
  { key: 'futureImprovements', id: 'future-improvements', title: 'Future Improvements' },
];

/** The project's write-up fields laid out as case study sections. */
export function StandardCaseStudy({ project }: { project: Project }) {
  // The first paragraph is the overview above, so the rest opens the write-up.
  const about = paragraphs(project.longDescription).slice(1);
  return (
    <>
      {about.length > 0 && (
        <>
          <CaseHeading id="about" level={2}>
            About This Project
          </CaseHeading>
          {about.map((p) => (
            <P key={p}>{p}</P>
          ))}
        </>
      )}
      {SECTIONS.map(({ key, id, title }) => {
        const body = paragraphs(project[key] as string | undefined);
        if (body.length === 0) return null;
        return (
          <section key={id}>
            <CaseHeading id={id} level={2}>
              {title}
            </CaseHeading>
            {body.map((p) => (
              <P key={p}>{p}</P>
            ))}
          </section>
        );
      })}
      {project.teamImage && (
        <>
          <CaseHeading id="the-team" level={2}>
            The Team
          </CaseHeading>
          <Figure title="The team" caption={project.teamCaption ?? `The ${project.title} team.`}>
            <img src={project.teamImage} alt={project.teamCaption || `${project.title} team`} className="mx-auto h-auto w-full max-w-md rounded-lg" />
          </Figure>
        </>
      )}
    </>
  );
}
