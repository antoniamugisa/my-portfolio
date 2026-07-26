import React from 'react';
import { Link } from 'react-router-dom';
import { projects } from '@/data/portfolio';

const Projects = () => {
  const getYear = (dateString: string) => new Date(dateString).getFullYear();

  return (
    <div className="min-h-screen bg-background pt-24 flex flex-col">
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6 flex-grow">
        <section className="py-8 md:py-12 text-[15px] md:text-base leading-relaxed">
          <p className="mb-6 max-w-2xl text-foreground/70">
            Things I&apos;ve built that I&apos;m proud of and still like talking about.
          </p>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {projects.map((project) => {
              const previewVideo = project.thumbnailVideo || project.demoVideo;
              const fitToVideo = project.thumbnailFit === 'contain';
              return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group block"
              >
                <div
                  className={
                    fitToVideo
                      ? 'overflow-hidden rounded-lg bg-muted/40'
                      : 'relative h-64 md:h-72 overflow-hidden rounded-lg bg-muted/40'
                  }
                >
                  {previewVideo && project.thumbnailBackground ? (
                    <>
                      <img
                        src={project.thumbnailBackground}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-5">
                        <video
                          src={previewVideo}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="max-h-full w-full max-w-[94%] rounded-lg object-contain shadow-lg"
                        />
                      </div>
                    </>
                  ) : previewVideo ? (
                    <video
                      src={previewVideo}
                      poster={project.image}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className={
                        fitToVideo
                          ? 'block w-full h-auto'
                          : 'h-full w-full object-cover'
                      }
                    />
                  ) : (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                </div>

                <p className="mt-2 text-[15px] md:text-base font-normal text-foreground/45 leading-relaxed">
                  {getYear(project.date)} / {project.category}
                </p>
                <h2 className="mt-0.5 text-[15px] md:text-base font-normal text-foreground leading-relaxed">
                  {project.title}
                </h2>
              </Link>
              );
            })}
          </div>

          <div className="h-32 md:h-16"></div>
        </section>
      </div>
    </div>
  );
};

export default Projects;
