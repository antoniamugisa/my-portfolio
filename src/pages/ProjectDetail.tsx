import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Navigate } from 'react-router-dom';
import { projects } from '@/data/portfolio';
import { Project } from '@/data/projects';
import BikeShareTorontoPage from '@/pages/bike-share-toronto/page';
import { caseStudies } from '@/pages/case-studies';
import { CaseStudyLayout } from '@/components/case-study/CaseStudyLayout';
import { StandardCaseStudy, standardMeta } from '@/pages/case-studies/StandardCaseStudy';

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
  const hasBikeDemo = project.id === 'bike-share-toronto';
  const demoHref = project.demoUrl && /^https?:/.test(project.demoUrl) ? project.demoUrl : undefined;
  return (
    <>
      <CaseStudyLayout
        project={project}
        meta={caseStudy ? caseStudy.meta : standardMeta(project)}
        onOpenDemo={hasBikeDemo ? () => openBikeDemo() : undefined}
        demoHref={demoHref}
      >
        {caseStudy ? (
          <caseStudy.Content onOpenMoment={hasBikeDemo ? openBikeDemo : undefined} />
        ) : (
          <StandardCaseStudy project={project} />
        )}
      </CaseStudyLayout>
      {bikeDemoPortal}
    </>
  );
};

export default ProjectDetail;
