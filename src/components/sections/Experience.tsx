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
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">Experience</h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">My professional journey through the world of software development</p>
        </div>

        <div className="space-y-8 mb-16">
          <h3 className="text-3xl font-bold text-center mb-12">Professional Experience</h3>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-primary transform md:-translate-x-1/2"></div>
            <div className="space-y-12">
              {experiences.map((exp, index) => (
                <div key={index} className={`relative flex flex-col md:flex-row items-start md:items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  <div className="absolute left-2 md:left-1/2 w-4 h-4 bg-primary rounded-full transform md:-translate-x-1/2 border-4 border-background shadow-glow"></div>
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                    <Card className="p-6 bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card">
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
                      <div className="space-y-4">
                        <div>
                          <h6 className="font-semibold mb-2">Key Achievements:</h6>
                          <ul className="space-y-1 text-foreground/80">
                            {exp.achievements.map((achievement: string, achIndex: number) => (
                              <li key={achIndex} className="flex items-start">
                                <span className="text-primary mr-2 mt-1">•</span>
                                <span className="text-sm">{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-semibold mb-2">Technologies:</h6>
                          <div className="flex flex-wrap gap-2">
                            {exp.technologies.map((tech: string, techIndex: number) => (
                              <Badge key={techIndex} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/30 hover:bg-primary/20">{tech}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-3xl font-bold text-center mb-12">Education</h3>
          {education.map((edu, index) => (
            <Card key={index} className="p-8 bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-primary">{edu.degree}</h4>
                  <h5 className="text-lg font-semibold text-foreground/90">{edu.institution}</h5>
                </div>
                <div className="text-sm text-foreground/70 flex items-center"><Calendar className="w-4 h-4 mr-1" />{edu.duration}</div>
              </div>
              <p className="text-foreground/80 mb-4 leading-relaxed">{edu.description}</p>
              <div>
                <h6 className="font-semibold mb-2">Involvement:</h6>
                <div className="flex flex-wrap gap-2">
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


