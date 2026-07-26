import React from 'react';
import { Badge } from '@/components/ui/badge';
import { experiences } from '@/data/portfolio';

const Experience: React.FC = () => {
  return (
    <section id="experience" className="bg-background py-12 md:py-16">
      <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
        <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] gap-x-6 md:gap-x-10 gap-y-8 md:gap-y-10">
          {experiences.map((exp, index) => (
            <React.Fragment key={index}>
              <div className="space-y-1 pr-2 text-[15px] md:text-base leading-relaxed">
                <p className="font-normal text-foreground whitespace-nowrap">
                  {exp.company}
                </p>
                <p className="font-normal text-foreground/70 whitespace-nowrap">{exp.duration}</p>
                <p className="font-normal text-foreground/55 whitespace-nowrap">{exp.location}</p>
              </div>

              <div className="space-y-3 text-[15px] md:text-base">
                <p className="font-normal text-foreground/70 leading-relaxed">
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
