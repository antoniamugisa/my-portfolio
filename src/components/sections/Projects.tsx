import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';
import { projects } from '@/data/portfolio';

type ProjectsProps = {
  selectedFilter: string;
  onSelectFilter: (value: string) => void;
};

const Projects: React.FC<ProjectsProps> = ({ selectedFilter, onSelectFilter }) => {
  const allProjects = projects;

  return (
    <section id="projects" className="py-16 md:py-24 pb-24 md:pb-24 bg-secondary">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="grid grid-cols-12 gap-4 md:gap-8">
          {/* Left side - Title */}
          <div className="col-span-12 lg:col-span-3 order-1 lg:order-1">
            <div className="sticky top-16 md:top-24 pb-4 md:pb-8 text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold font-heading mb-6 bg-primary bg-clip-text text-transparent leading-[1.2] pb-2">Projects</h2>
              <p className="text-lg text-foreground/70 leading-relaxed mb-6">A few things I've built</p>
              
              {/* Explore Projects Button - Desktop Only */}
              <div className="hidden lg:block">
                <Button asChild size="lg" className="bg-primary hover:shadow-glow transition-all duration-300">
                  <Link to="/projects">
                    Explore Projects
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right side - Project cards */}
          <div className="col-span-12 lg:col-span-9 order-2 lg:order-2">
            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {allProjects.filter(project => project.featured).map((project, index) => (
                <Link key={index} to={`/projects/${project.id}`}>
                  <Card className="rounded-xl bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card group cursor-pointer">
                    <div className="aspect-video overflow-hidden rounded-t-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                      <img 
                        src={project.image} 
                        alt={project.title} 
                        className={`w-full h-full transition-transform duration-300 group-hover:scale-105 ${
                          project.id === 'dal gazette app' ? 'object-contain p-4' : 'object-cover'
                        }`} 
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1">
                          <h4 className="text-xl font-bold text-primary">{project.title}</h4>
                          <div className="text-muted-foreground group-hover:text-primary transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">{project.category}</Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              project.status === 'Completed' 
                                ? 'border-green-500/50 text-green-600 dark:text-green-400' 
                                : project.status === 'Ongoing'
                                ? 'border-yellow-500/50 text-yellow-600 dark:text-yellow-400'
                                : 'border-blue-500/50 text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-foreground/80 mb-4 leading-relaxed">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="outline" className="text-sm border-border hover:border-primary/50 hover:text-primary transition-colors">{tech}</Badge>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        {project.demoUrl && project.demoUrl !== "#" && (
                          <Button 
                            size="sm" 
                            className="bg-primary hover:shadow-glow flex-1" 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.open(project.demoUrl, '_blank', 'noopener,noreferrer');
                            }}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Demo
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-border hover:border-primary/50 hover:text-primary flex-1"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(project.githubUrl, '_blank', 'noopener,noreferrer');
                          }}
                        >
                          <Github className="w-4 h-4 mr-2" />
                          Code
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            
            {/* Explore Projects Button - Mobile Only */}
            <div className="mt-8 lg:hidden flex justify-center">
              <Button asChild size="lg" className="bg-primary hover:shadow-glow transition-all duration-300">
                <Link to="/projects">
                  Explore Projects
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;



