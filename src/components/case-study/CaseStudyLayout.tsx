import React, { useRef } from 'react';
import { ExternalLink, Github, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Project } from '@/data/projects';
import { TableOfContents, TableOfContentsCompact } from './TableOfContents';

export type CaseStudyMeta = {
  /** Omitted when the project has no role written up. */
  role?: string;
  timeline: string;
  /** Shorter than the project's full technology list: what someone skimming should know. */
  stack: string[];
  overview: React.ReactNode;
};

type CaseStudyLayoutProps = {
  project: Project;
  meta: CaseStudyMeta;
  /** Opens the live demo; omit for projects without one. */
  onOpenDemo?: () => void;
  /** External live demo, opened in a new tab. */
  demoHref?: string;
  children: React.ReactNode;
};

/**
 * Long-form project page: a slim header (the site nav already links back to Projects), the hero, a role/timeline/stack row beside the overview,
 * then the write-up in one readable column with an "On this page" menu to its left.
 */
export function CaseStudyLayout({ project, meta, onOpenDemo, demoHref, children }: CaseStudyLayoutProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const year = new Date(project.date).getFullYear();

  return (
    <div className="min-h-screen bg-background pt-20 md:pt-24">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-x-12 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,42rem)_minmax(0,1fr)]">
        <aside className="hidden lg:block" aria-hidden={false}>
          <div className="h-full pt-[20rem]">
            <TableOfContents containerRef={bodyRef} />
          </div>
        </aside>

        <article id="project-detail-top" className="min-w-0 scroll-mt-24 pt-8 md:pt-12">
          <header className="mb-8">
            <div className="text-sm text-muted-foreground">
              {year} · {project.category}
            </div>
            <h1 className="mt-2 text-2xl font-normal leading-snug text-foreground md:text-3xl">{project.title}</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/70 md:text-base">{project.description}</p>
            {/* On phones the overview sits below a long stack list, so the links come up here instead. */}
            <ProjectLinks project={project} onOpenDemo={onOpenDemo} demoHref={demoHref} className="mt-5 flex sm:hidden" />
          </header>

          {onOpenDemo ? (
            <button
              type="button"
              onClick={onOpenDemo}
              className="group relative block w-full overflow-hidden rounded-xl border border-border bg-muted text-left"
              aria-label={`Open the ${project.title} live demo`}
            >
              <HeroMedia project={project} />
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-sm transition-opacity group-hover:bg-black/75">
                <Play className="h-3.5 w-3.5" aria-hidden />
                Try it live
              </span>
            </button>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-muted">
              <HeroMedia project={project} />
            </div>
          )}

          <div className="mt-8 grid gap-6 border-b border-border pb-10 text-sm sm:grid-cols-[11rem_minmax(0,1fr)]">
            <dl className="space-y-4">
              {meta.role && (
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Role</dt>
                  <dd className="mt-1 text-foreground/80">{meta.role}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Timeline</dt>
                <dd className="mt-1 text-foreground/80">{meta.timeline}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Stack</dt>
                <dd className="mt-1 text-foreground/80">
                  {meta.stack.map((s) => (
                    <span key={s} className="block">
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
            <div>
              <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Overview</div>
              <div className="mt-1 text-[15px] leading-relaxed text-foreground/80 md:text-base">{meta.overview}</div>
              <ProjectLinks project={project} onOpenDemo={onOpenDemo} demoHref={demoHref} className="mt-6 hidden sm:flex" />
            </div>
          </div>

          <div ref={bodyRef} className="case-study-body pt-10 pb-24">
            <div className="lg:hidden">
              <TableOfContentsCompact containerRef={bodyRef} />
            </div>
            {children}
          </div>
        </article>
      </div>
    </div>
  );
}

/**
 * The hero: a dedicated hero loop, else the looping preview if there is one (inset over its background when it has one),
 * else the demo recording with controls, else the cover image.
 */
function HeroMedia({ project }: { project: Project }) {
  if (project.heroVideo) {
    return (
      <video className="aspect-[16/9] w-full object-cover" src={project.heroVideo} autoPlay muted loop playsInline preload="metadata" />
    );
  }
  if (project.thumbnailVideo) {
    const inset = Boolean(project.thumbnailBackground);
    return (
      <div
        className="aspect-[16/9] w-full bg-cover bg-center"
        style={inset ? { backgroundImage: `url(${project.thumbnailBackground})` } : undefined}
      >
        <video
          className={inset ? 'h-full w-full object-contain p-6 md:p-10' : 'h-full w-full object-cover'}
          src={project.thumbnailVideo}
          poster={inset ? undefined : project.image}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </div>
    );
  }
  if (project.demoVideo) {
    return (
      <video className="aspect-[16/9] w-full bg-black object-contain" src={project.demoVideo} poster={project.image} controls playsInline preload="metadata" />
    );
  }
  return <img className="aspect-[16/9] w-full object-cover" src={project.image} alt="" />;
}

/** Code and Live Demo buttons; renders nothing when the project has neither. */
function ProjectLinks({
  project,
  onOpenDemo,
  demoHref,
  className,
}: {
  project: Project;
  onOpenDemo?: () => void;
  demoHref?: string;
  className: string;
}) {
  const hasCode = Boolean(project.githubUrl && project.githubUrl !== '#');
  if (!hasCode && !onOpenDemo && !demoHref) return null;
  return (
    <div className={`flex-wrap items-center gap-2 ${className}`}>
      {hasCode && (
        <Button variant="outline" size="sm" asChild>
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
            <Github className="mr-1.5 h-4 w-4" aria-hidden />
            Code
          </a>
        </Button>
      )}
      {onOpenDemo && (
        <Button size="sm" className="bg-primary transition-all duration-300 hover:shadow-glow" onClick={onOpenDemo}>
          <Play className="mr-1.5 h-4 w-4" aria-hidden />
          Live Demo
        </Button>
      )}
      {!onOpenDemo && demoHref && (
        <Button size="sm" className="bg-primary transition-all duration-300 hover:shadow-glow" asChild>
          <a href={demoHref} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1.5 h-4 w-4" aria-hidden />
            {project.demoLabel ?? 'Live Demo'}
          </a>
        </Button>
      )}
    </div>
  );
}
