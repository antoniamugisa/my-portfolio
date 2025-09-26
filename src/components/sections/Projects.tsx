import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Filter, ArrowRight } from 'lucide-react';
import { categories, projects as allProjects } from '@/data/portfolio';
import { Link } from 'react-router-dom';

type ProjectsProps = {
  selectedFilter: string;
  onSelectFilter: (value: string) => void;
};

const Projects: React.FC<ProjectsProps> = ({ selectedFilter, onSelectFilter }) => {
  const filteredProjects = selectedFilter === 'All' ? allProjects : allProjects.filter((p) => p.category === selectedFilter);
  const featuredProjects = allProjects.filter((p) => p.featured);

  return (
    <section id="projects" className="py-24 bg-gradient-secondary">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">projects</h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">a few things i've built</p>
        </div>

        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-12">highlighted work</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {featuredProjects.map((project, index) => (
              <Card key={index} className="overflow-hidden bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card group">
                <div className="aspect-video overflow-hidden">
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
                      <Badge key={techIndex} variant="outline" className="text-xs border-border hover:border-primary/50 hover:text-primary transition-colors">{tech}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button size="sm" className="bg-gradient-primary hover:shadow-glow flex-1" asChild>
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4 mr-2" />Live Demo</a>
                    </Button>
                    <Button size="sm" variant="outline" className="border-border hover:border-primary/50 hover:text-primary flex-1" asChild>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"><Github className="w-4 h-4 mr-2" />Code</a>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold">all projects</h3>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button key={category} variant={selectedFilter === category ? 'default' : 'outline'} size="sm" onClick={() => onSelectFilter(category)} className={selectedFilter === category ? 'bg-gradient-primary hover:shadow-glow' : 'border-border hover:border-primary/50 hover:text-primary'}>
                  <Filter className="w-4 h-4 mr-2" />
                  {category}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <Card key={index} className="overflow-hidden bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card group">
                <div className="aspect-video overflow-hidden">
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-primary">{project.title}</h4>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30 text-xs">{project.category}</Badge>
                  </div>
                  <p className="text-foreground/80 text-sm mb-3 leading-relaxed line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.technologies.slice(0, 3).map((tech, techIndex) => (
                      <Badge key={techIndex} variant="outline" className="text-xs border-border hover:border-primary/50 hover:text-primary transition-colors">{tech}</Badge>
                    ))}
                    {project.technologies.length > 3 && <Badge variant="outline" className="text-xs border-border">+{project.technologies.length - 3}</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-gradient-primary hover:shadow-glow flex-1 text-xs" asChild>
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3 h-3 mr-1" />Demo</a>
                    </Button>
                    <Button size="sm" variant="outline" className="border-border hover:border-primary/50 hover:text-primary flex-1 text-xs" asChild>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"><Github className="w-3 h-3 mr-1" />Code</a>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link to="/projects">
            <Button size="lg" variant="outline" className="border-border hover:border-primary/50 hover:text-primary group">
              View All Projects
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Projects;



