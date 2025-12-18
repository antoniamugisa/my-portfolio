import React from 'react';
import { Badge } from '@/components/ui/badge';
import { experiences } from '@/data/portfolio';

const Experience: React.FC = () => {
  return (
    <section id="experience" className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/60">
            EXPERIENCE
          </p>
        </div>

        <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] gap-x-6 md:gap-x-10 gap-y-8 md:gap-y-10">
          {/* Header row */}
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">
            Team
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">
            Description
          </div>

          {/* Rows */}
          {experiences.map((exp, index) => (
            <React.Fragment key={index}>
              <div className="space-y-1 pr-2">
                <p className="text-base md:text-lg font-semibold text-foreground whitespace-nowrap">
                  {exp.company}
                </p>
                <p className="text-sm text-foreground/70 whitespace-nowrap">{exp.duration}</p>
                <p className="text-xs text-foreground/60 whitespace-nowrap">{exp.location}</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
                  {exp.description}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {exp.technologies.map((tech: string, techIndex: number) => (
                    <Badge
                      key={techIndex}
                      variant="secondary"
                      className="text-xs bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                    >
                      {tech}
                    </Badge>
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



