import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github } from 'lucide-react';
import { projects } from '@/data/portfolio';

type ProjectsProps = {
  selectedFilter: string;
  onSelectFilter: (value: string) => void;
};

const Projects: React.FC<ProjectsProps> = ({ selectedFilter, onSelectFilter }) => {
  const allProjects = projects;

  return (
    <section id="projects" className="py-24 bg-gradient-secondary">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-12 gap-8">
          {/* Left side - Title */}
          <div className="col-span-12 lg:col-span-3">
            <div className="sticky top-24 pb-8">
              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold font-heading mb-6 bg-gradient-primary bg-clip-text text-transparent leading-[1.2] pb-2">projects</h2>
              <p className="text-lg text-foreground/70 leading-relaxed">a few things i've built</p>
            </div>
          </div>

          {/* Right side - Project cards */}
          <div className="col-span-12 lg:col-span-9">
            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allProjects.map((project, index) => (
                <Card key={index} className="rounded-xl bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card group">
                  <div className="aspect-video overflow-hidden rounded-t-xl">
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-bold text-primary">{project.title}</h4>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">{project.category}</Badge>
                    </div>
                    <p className="text-foreground/80 mb-4 leading-relaxed">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech, techIndex) => (
                        <Badge key={techIndex} variant="outline" className="text-sm border-border hover:border-primary/50 hover:text-primary transition-colors">{tech}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Button size="sm" className="bg-gradient-primary hover:shadow-glow flex-1" asChild>
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Demo
                        </a>
                      </Button>
                      <Button size="sm" variant="outline" className="border-border hover:border-primary/50 hover:text-primary flex-1" asChild>
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-2" />
                          Code
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;



