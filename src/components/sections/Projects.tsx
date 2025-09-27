import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, ChevronLeft, ChevronRight } from 'lucide-react';

type ProjectsProps = {
  selectedFilter: string;
  onSelectFilter: (value: string) => void;
};

const Projects: React.FC<ProjectsProps> = ({ selectedFilter, onSelectFilter }) => {
  const allProjects = [
    {
      title: "Portfolio Website",
      description: "A modern, responsive portfolio website showcasing my development journey with an anime-inspired design. Features include dynamic project showcases, blog integration, and a sleek UI built with React and TypeScript.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
      technologies: ["React", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui", "React Router"],
      category: "Frontend",
      demoUrl: "#",
      githubUrl: "https://github.com/antoniamugisa/anime-dev-space",
      featured: true
    },
    {
      title: "Anime Recommendation Engine",
      description: "Machine learning-powered recommendation system that suggests anime based on user preferences and viewing history. Built with Python and React with a sleek anime-inspired interface.",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600",
      technologies: ["Python", "React", "TensorFlow", "MongoDB", "Docker"],
      category: "Machine Learning",
      demoUrl: "#",
      githubUrl: "#",
      featured: true
    },
    
  ];

  const scrollLeft = () => {
    const container = document.getElementById('projects-scroll');
    if (container) {
      container.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('projects-scroll');
    if (container) {
      container.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <section id="projects" className="py-24 bg-gradient-secondary">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold font-heading mb-6 bg-gradient-primary bg-clip-text text-transparent leading-[1.2] pb-2">projects</h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">a few things i've built</p>
        </div>

        {/* Horizontal Scrollable Projects */}
        <div className="relative">
          {/* Scroll Buttons */}
          <button
            onClick={scrollLeft}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border border-border rounded-full p-2 hover:bg-background transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollRight}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border border-border rounded-full p-2 hover:bg-background transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Scrollable Container */}
          <div
            id="projects-scroll"
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 pl-16 pr-16"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {allProjects.map((project, index) => (
              <Card key={index} className="flex-shrink-0 w-96 bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card group">
                <div className="aspect-video overflow-hidden">
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-primary">{project.title}</h4>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">{project.category}</Badge>
                  </div>
                  <p className="text-foreground/80 mb-4 leading-relaxed line-clamp-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.slice(0, 4).map((tech, techIndex) => (
                      <Badge key={techIndex} variant="outline" className="text-xs border-border hover:border-primary/50 hover:text-primary transition-colors">{tech}</Badge>
                    ))}
                    {project.technologies.length > 4 && (
                      <Badge variant="outline" className="text-xs border-border">+{project.technologies.length - 4}</Badge>
                    )}
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
    </section>
  );
};

export default Projects;



