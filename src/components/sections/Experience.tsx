import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import { education, experiences } from '@/data/portfolio';

const Experience: React.FC = () => {
  return (
    <section id="experience" className="py-24 bg-background">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 font-heading" style={{color: "hsl(222 100% 65%)"}}>experience</h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">my professional journey through the world of software development</p>
        </div>

        <div className="mb-16">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Timeline on the left */}
            <div className="lg:col-span-4">
              <div className="relative">
                <div className="absolute left-6 top-0 w-0.5 bg-gradient-primary" style={{height: 'calc(100% + 240px)'}}></div>
                <div className="space-y-6">
                  {experiences.map((exp, index) => (
                    <div key={index} className="relative flex items-start" style={{paddingTop: index === 0 ? '0px' : '280px'}}>
                      <div className="absolute left-4 w-4 h-4 bg-primary rounded-full border-4 border-background shadow-glow"></div>
                      <div className="ml-12">
                        <div className="text-sm text-foreground/70 mb-1">{exp.duration}</div>
                        <div className="font-semibold text-primary">{exp.position}</div>
                        <div className="text-sm text-foreground/80">{exp.company}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Experience cards on the right */}
            <div className="lg:col-span-8">
              <div className="space-y-6">
                {experiences.map((exp, index) => (
                  <Card key={index} className="p-6 bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-primary">{exp.position}</h4>
                        <h5 className="text-lg font-semibold text-foreground/90">{exp.company}</h5>
                      </div>
                      <Briefcase className="text-primary w-5 h-5 mt-1" />
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-foreground/70 mb-4">
                      <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{exp.duration}</span>
                      <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{exp.location}</span>
                    </div>
                    <p className="text-foreground/80 mb-4 leading-relaxed">{exp.description}</p>
                    
                    {/* Summary instead of achievements */}
                    <div className="mb-4">
                      <p className="text-foreground/80 leading-relaxed">
                        {exp.achievements.join(' ')}
                      </p>
                    </div>
                    
                    {/* Technologies without heading */}
                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech: string, techIndex: number) => (
                        <Badge key={techIndex} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/30 hover:bg-primary/20">{tech}</Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-3xl font-bold font-heading text-center mb-12">education</h3>
          {education.map((edu, index) => (
            <Card key={index} className="p-8 bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card flex flex-col items-center justify-center text-center">
              <div className="mb-4">
                <h4 className="text-xl font-bold text-primary mb-2">{edu.degree}</h4>
                <h5 className="text-lg font-semibold text-foreground/90 mb-2">{edu.institution}</h5>
                <div className="text-sm text-foreground/70 flex items-center justify-center"><Calendar className="w-4 h-4 mr-1" />{edu.duration}</div>
              </div>
              <p className="text-foreground/80 mb-4 leading-relaxed">{edu.description}</p>
              <div>
                <h6 className="font-semibold mb-2">Involvement:</h6>
                <div className="flex flex-wrap gap-2 justify-center">
                  {edu.highlights.map((highlight: string, hIndex: number) => (
                    <Badge key={hIndex} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/30">{highlight}</Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;



