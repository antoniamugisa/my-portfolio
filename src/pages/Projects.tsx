import React from 'react';
import { Link } from 'react-router-dom';
import { projects } from '@/data/portfolio';

const Projects = () => {
  const getYear = (dateString: string) => new Date(dateString).getFullYear();

  return (
    <div className="min-h-screen bg-background pt-24 md:pt-28 flex flex-col">
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6 flex-grow">
        <section className="py-8 md:py-12">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group block"
              >
                <div className="h-64 md:h-72 overflow-hidden rounded-lg bg-muted/40">
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

          <div className="h-32 md:h-16"></div>
        </section>
      </div>
    </div>
  );
};

export default Projects;
