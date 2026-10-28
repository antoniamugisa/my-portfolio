import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Play } from 'lucide-react';
import { projects } from '@/data/portfolio';
import { Project } from '@/data/projects';
import BikeShareTorontoPage from '@/pages/bike-share-toronto/page';
import { caseStudies } from '@/pages/case-studies';
import { CaseStudyLayout } from '@/components/case-study/CaseStudyLayout';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [bikeDemoOpen, setBikeDemoOpen] = useState(false);

  // Find the project by ID
  const project = projects.find(p => p.id === id) as Project | undefined;

  const closeBikeDemo = useCallback(() => {
    setBikeDemoOpen(false);
    if (window.location.hash === '#bike-share-demo') {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
    window.requestAnimationFrame(() => {
      document.getElementById('project-detail-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  useEffect(() => {
    if (id !== 'bike-share-toronto') setBikeDemoOpen(false);
  }, [id]);

  useEffect(() => {
    if (project?.id !== 'bike-share-toronto') return;
    if (window.location.hash !== '#bike-share-demo') return;
    setBikeDemoOpen(true);
  }, [project?.id]);

  useEffect(() => {
    if (!bikeDemoOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [bikeDemoOpen]);

  /** Opens the bike share demo, optionally at a Toronto wall time ("2024-07-01T22:00") and following a ride. */
  const openBikeDemo = useCallback((isoLocal?: string, rideId?: string) => {
    const search = isoLocal ? `?t=${isoLocal}${rideId ? `&ride=${encodeURIComponent(rideId)}` : ''}` : window.location.search;
    window.history.replaceState(null, '', `${window.location.pathname}${search}#bike-share-demo`);
    setBikeDemoOpen(true);
  }, []);

  // If project not found, redirect to projects page
  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  const bikeDemoPortal =
    bikeDemoOpen &&
    project.id === 'bike-share-toronto' &&
    createPortal(
      <div
        className="fixed inset-0 z-[100] h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#050505] overscroll-none"
        role="dialog"
        aria-modal="true"
        aria-label="Bike Share Toronto live demo"
      >
        <BikeShareTorontoPage embedded={false} portalFullscreen onRequestProjectDetails={closeBikeDemo} />
      </div>,
      document.body,
    );

  const caseStudy = caseStudies[project.id];
  if (caseStudy) {
    const hasBikeDemo = project.id === 'bike-share-toronto';
    return (
      <>
        <CaseStudyLayout project={project} meta={caseStudy.meta} onOpenDemo={hasBikeDemo ? () => openBikeDemo() : undefined}>
          <caseStudy.Content onOpenMoment={hasBikeDemo ? openBikeDemo : undefined} />
        </CaseStudyLayout>
        {bikeDemoPortal}
      </>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background pt-20 md:pt-24">
      {/* Project Header */}
      <article id="project-detail-top" className="mx-auto w-full max-w-5xl px-6 md:px-6 scroll-mt-24">
        {/* Hero Image with Overlay */}
        <div className="relative aspect-[4/3] md:aspect-[21/9] min-h-[250px] md:min-h-[400px] overflow-hidden rounded-lg mb-8 shadow-card bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
          <img 
            src={project.image} 
            alt={project.title}
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            width={1400}
            height={600}
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Content Overlay */}
          <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-between">
            {/* Top Right - Tags */}
            <div className="flex justify-end">
              <div className="flex flex-wrap gap-2">
                {project.tags.slice(0, 3).map((tag) => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30"
                  >
                    {tag}
                  </span>
                ))}
                {project.tags.length > 3 && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30">
                    +{project.tags.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Left - Date, Title, Subtitle */}
            <div className="space-y-2 text-[15px] md:text-base leading-relaxed">
              <div className="text-white/90 font-normal">
                {formatDate(project.date)}
              </div>
              
              <h1 className="font-normal text-white leading-relaxed">
                {project.title}
              </h1>
              
              <p className="text-white/90 font-normal leading-relaxed max-w-2xl">
                {project.description}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {(project.demoUrl && project.demoUrl !== '#') ||
        (project.githubUrl && project.githubUrl !== '#') ? (
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 border-b border-border pb-6">
              {project.demoUrl && project.demoUrl !== '#' && (
                project.demoUrl.startsWith('#') ? (
                  project.id === 'bike-share-toronto' ? (
                    <Button
                      type="button"
                      className="bg-primary hover:shadow-glow transition-all duration-300"
                      onClick={() => {
                        setBikeDemoOpen(true);
                        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#bike-share-demo`);
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Live Demo
                    </Button>
                  ) : (
                    <Button asChild className="bg-primary hover:shadow-glow transition-all duration-300">
                      <a
                        href={project.demoUrl}
                        onClick={(e) => {
                          e.preventDefault();
                          const elId = project.demoUrl.slice(1);
                          document.getElementById(elId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Live Demo
                      </a>
                    </Button>
                  )
                ) : (
                  <Button asChild className="bg-primary hover:shadow-glow transition-all duration-300">
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Live Demo
                    </a>
                  </Button>
                )
              )}
              {project.githubUrl && project.githubUrl !== '#' && (
                <Button variant="outline" asChild>
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4 mr-2" />
                    View Code
                  </a>
                </Button>
              )}
            </div>
          </div>
        ) : null}

        {/* Project Details */}
        <div className="mb-16 space-y-8 text-[15px] md:text-base text-foreground/70 leading-relaxed">
          {/* Project Description */}
          <div>
            <h2 className="mb-4 font-normal text-foreground leading-relaxed">About This Project</h2>
            <div className="space-y-4">
              {/* The short description is already in the hero, so only repeat it when there's nothing longer. */}
              <p className="font-normal leading-relaxed whitespace-pre-line">
                {project.longDescription?.trim() || project.description}
              </p>
            </div>

            {/* Demo Video */}
            {project.demoVideo && (
              <div className="mt-8">
                <h3 className="mb-4 font-normal text-foreground leading-relaxed">Demo</h3>
                <video
                  controls
                  className="w-full rounded-lg shadow-md"
                  preload="metadata"
                >
                  <source src={project.demoVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>

          {/* Team Image */}
          {project.teamImage && (
            <div>
              <h2 className="mb-4 font-normal text-foreground leading-relaxed">The Team</h2>
              <div className="mx-auto max-w-md">
                <img
                  src={project.teamImage}
                  alt={project.teamCaption || `${project.title} team`}
                  className="w-full h-auto rounded-lg"
                />
                {project.teamCaption && (
                  <p className="mt-2 text-center text-foreground/70">
                    {project.teamCaption}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Key Features */}
          {project.keyFeatures && (
            <div>
              <h2 className="mb-4 font-normal text-foreground leading-relaxed">Key Features</h2>
              <p className="font-normal leading-relaxed whitespace-pre-line">
                {project.keyFeatures}
              </p>
            </div>
          )}

          {/* Architecture */}
          {project.architecture && (
            <div>
              <h2 className="mb-4 font-normal text-foreground leading-relaxed">How It Works</h2>
              <p className="font-normal leading-relaxed whitespace-pre-line">
                {project.architecture}
              </p>
            </div>
          )}

          {/* Challenges */}
          {project.challenges && (
            <div>
              <h2 className="mb-4 font-normal text-foreground leading-relaxed">Challenges</h2>
              <p className="font-normal leading-relaxed whitespace-pre-line">
                {project.challenges}
              </p>
            </div>
          )}

          {/* Learnings */}
          {project.learnings && (
            <div>
              <h2 className="mb-4 font-normal text-foreground leading-relaxed">What I Learned</h2>
              <p className="font-normal leading-relaxed whitespace-pre-line">
                {project.learnings}
              </p>
            </div>
          )}

          {/* Future Improvements */}
          {project.futureImprovements && (
            <div>
              <h2 className="mb-4 font-normal text-foreground leading-relaxed">Future Improvements</h2>
              <p className="font-normal leading-relaxed whitespace-pre-line">
                {project.futureImprovements}
              </p>
            </div>
          )}
        </div>
      </article>

      {bikeDemoPortal}
    </div>
  );
};

export default ProjectDetail;
