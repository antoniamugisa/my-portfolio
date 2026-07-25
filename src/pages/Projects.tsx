import React from 'react';
import { Link } from 'react-router-dom';
import { projects } from '@/data/portfolio';

const Projects = () => {
  const getYear = (dateString: string) => new Date(dateString).getFullYear();
  const useMasonry = projects.length > 4;

  const aspectClasses = [
    'aspect-[4/3]',
    'aspect-[3/4]',
    'aspect-square',
    'aspect-[16/10]',
    'aspect-[3/4]',
  ];

  return (
    <div className="min-h-screen bg-background pt-24 md:pt-28">
      <div
        className={`mx-auto w-full px-4 md:px-6 py-8 md:py-10 ${
          useMasonry ? 'max-w-6xl' : 'max-w-5xl'
        }`}
      >
        <div
          className={
            useMasonry
              ? 'columns-1 sm:columns-2 lg:columns-3 gap-x-3 md:gap-x-4'
              : 'grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-5 md:gap-x-4 md:gap-y-6'
          }
        >
          {projects.map((project, index) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className={`group block ${
                useMasonry ? 'mb-5 md:mb-6 break-inside-avoid' : ''
              }`}
            >
              <div
                className={`overflow-hidden rounded-xl bg-muted/40 ${
                  useMasonry
                    ? aspectClasses[index % aspectClasses.length]
                    : 'aspect-[4/3]'
                }`}
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>

              <p className="mt-2 text-sm text-foreground/45">
                {getYear(project.date)} / {project.category}
              </p>
              <h2 className="mt-0.5 text-[15px] md:text-base text-foreground leading-snug">
                {project.title}
              </h2>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
