import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '@/data/portfolio';

function PreviewVideo({
  src,
  poster,
  className,
  /** Stagger start so multiple demos don’t fight for bandwidth on land. */
  loadDelayMs = 0,
}: {
  src: string;
  poster?: string;
  className: string;
  loadDelayMs?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(loadDelayMs === 0);
  const [ready, setReady] = useState(false);

  // Start loading as soon as the projects page is mounted (optionally staggered).
  useEffect(() => {
    if (loadDelayMs <= 0) {
      setShouldLoad(true);
      return;
    }
    const t = window.setTimeout(() => setShouldLoad(true), loadDelayMs);
    return () => window.clearTimeout(t);
  }, [loadDelayMs]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !shouldLoad) return;

    const tryPlay = () => {
      el.play()
        .then(() => setReady(true))
        .catch(() => {});
    };

    const onCanPlay = () => tryPlay();
    const onPlaying = () => setReady(true);

    el.addEventListener('canplay', onCanPlay);
    el.addEventListener('playing', onPlaying);
    // Kick off fetch immediately; play when enough data is buffered.
    el.load();
    tryPlay();

    return () => {
      el.removeEventListener('canplay', onCanPlay);
      el.removeEventListener('playing', onPlaying);
    };
  }, [shouldLoad, src]);

  return (
    <video
      ref={ref}
      src={shouldLoad ? src : undefined}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay={shouldLoad}
      preload={shouldLoad ? 'auto' : 'none'}
      className={`${className} transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}

const Projects = () => {
  const getYear = (dateString: string) => new Date(dateString).getFullYear();

  // Collect video indices so we can stagger only video cards, not static ones.
  let videoOrder = 0;

  return (
    <div className="min-h-screen bg-background pt-20 md:pt-24 flex flex-col">
      <div className="mx-auto w-full max-w-5xl px-6 md:px-6 flex-grow">
        <section className="py-8 md:py-12 text-[15px] md:text-base leading-relaxed">
          <p className="mb-6 max-w-2xl text-foreground/70">
            Things I&apos;ve built that I&apos;m proud of and still like talking about.
          </p>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {projects.map((project, index) => {
              const previewVideo = project.thumbnailVideo || project.demoVideo;
              const fitToVideo = project.thumbnailFit === 'contain';
              const priority = index < 2;
              const videoLoadDelay = previewVideo ? videoOrder++ * 280 : 0;

              return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group block"
              >
                <div
                  className={
                    fitToVideo
                      ? 'relative overflow-hidden rounded-lg bg-muted/40'
                      : 'relative h-64 md:h-72 overflow-hidden rounded-lg bg-muted/40'
                  }
                >
                  {previewVideo && project.thumbnailBackground ? (
                    <>
                      <img
                        src={project.thumbnailBackground}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="eager"
                        decoding="async"
                        fetchPriority={priority ? 'high' : 'auto'}
                      />
                      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-5">
                        <PreviewVideo
                          src={previewVideo}
                          loadDelayMs={videoLoadDelay}
                          className="max-h-full w-full max-w-[94%] rounded-lg object-contain shadow-lg"
                        />
                      </div>
                    </>
                  ) : previewVideo ? (
                    <>
                      {/* Poster stays visible until the video can play */}
                      <img
                        src={project.image}
                        alt=""
                        aria-hidden
                        className={
                          fitToVideo
                            ? 'pointer-events-none absolute inset-0 h-full w-full object-contain opacity-90'
                            : 'pointer-events-none absolute inset-0 h-full w-full object-cover'
                        }
                        loading="eager"
                        decoding="async"
                      />
                      <PreviewVideo
                        src={previewVideo}
                        poster={project.image}
                        loadDelayMs={videoLoadDelay}
                        className={
                          fitToVideo
                            ? 'relative z-[1] block w-full h-auto'
                            : 'relative z-[1] h-full w-full object-cover'
                        }
                      />
                    </>
                  ) : (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading={priority ? 'eager' : 'lazy'}
                      decoding="async"
                      fetchPriority={priority ? 'high' : 'auto'}
                      width={800}
                      height={450}
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
