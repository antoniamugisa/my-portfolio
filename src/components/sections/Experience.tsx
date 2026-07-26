import React from 'react';
import { experiences } from '@/data/portfolio';

const Experience: React.FC = () => {
  return (
    <section id="experience" className="bg-background py-8 md:py-12 text-[15px] md:text-base leading-relaxed">
      <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
        <p className="mb-8 max-w-2xl text-foreground/70">
          Where I&apos;ve been building lately.
        </p>
        <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] gap-x-6 md:gap-x-10 gap-y-8 md:gap-y-10">
          {experiences.map((exp, index) => (
            <React.Fragment key={index}>
              <div className="space-y-1 pr-2 leading-relaxed">
                <p className="font-normal text-foreground whitespace-nowrap">
                  {exp.company}
                </p>
                <p className="font-normal text-foreground/70 whitespace-nowrap">{exp.position}</p>
                <p className="font-normal text-foreground/55 whitespace-nowrap">{exp.duration}</p>
                <p className="font-normal text-foreground/45 whitespace-nowrap">{exp.location}</p>
              </div>

              <div className="space-y-3">
                <p className="font-normal text-foreground/70 leading-relaxed">
                  {exp.description}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {exp.technologies.map((tech: string) => (
                    <span
                      key={tech}
                      className="rounded-full bg-muted/60 px-2.5 py-0.5 text-xs text-foreground/55"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
