import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { experiences } from '@/data/portfolio';
import compassLogo from '@/assets/compass-logo.png';

const getCompanyLogo = (company: string): string => {
  const logoMap: Record<string, string> = {
    'Compass Visas': compassLogo,
    'Avanade': '/avanade-logo.jpg'
  };
  return logoMap[company] || '/placeholder.svg';
};

const Experience: React.FC = () => {
  return (
    <section id="experience" className="py-16 md:py-24 pb-24 md:pb-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="grid grid-cols-12 gap-4 md:gap-8">
          {/* Left side - Timeline and Experience cards */}
          <div className="col-span-12 lg:col-span-9 order-2 lg:order-1">
            <div className="relative">
              {/* Timeline */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary/30"></div>
              
                  <div className="space-y-4 md:space-y-6">
                {experiences.map((exp, index) => (
                <div key={index} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute left-4 top-6 w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg transform -translate-x-1/2"></div>
                  <Card className="p-6 bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card ml-12">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-primary">{exp.position}</h4>
                            <h5 className="text-lg font-semibold text-foreground/90">{exp.company}</h5>
                          </div>
                          <img src={getCompanyLogo(exp.company)} alt={exp.company} className="w-16 h-16 mt-1 object-contain" />
                        </div>
                  <div className="flex items-center space-x-4 text-sm text-foreground/70 mb-4">
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{exp.duration}</span>
                    <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{exp.location}</span>
                  </div>
                  
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
                </div>
              ))}
              </div>
            </div>
          </div>

          {/* Right side - Title */}
          <div className="col-span-12 lg:col-span-3 order-1 lg:order-2">
            <div className="sticky top-16 md:top-24 pb-4 md:pb-8 text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold font-heading mb-6 text-primary leading-[1.2] pb-2">Experience</h2>
              <p className="text-lg text-foreground/70 leading-relaxed">Where I contributed to impactful projects and expanded my technical expertise</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;



