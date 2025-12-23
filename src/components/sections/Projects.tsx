import React from 'react';
import { Link } from 'react-router-dom';
import { projects } from '@/data/portfolio';

type ProjectsProps = {
  selectedFilter: string;
  onSelectFilter: (value: string) => void;
};

const Projects: React.FC<ProjectsProps> = ({ selectedFilter, onSelectFilter }) => {
  const allProjects = projects;

  return (
    <section id="projects" className="py-12 md:py-16 bg-background relative z-20">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/60">
            PROJECTS
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {allProjects.map((project, index) => (
            <Link key={index} to={`/projects/${project.id}`} className="group">
              <div className="space-y-3">
                {/* Project Image */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-background border border-border/40 group-hover:border-primary/50 transition-all duration-300">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full transition-transform duration-300 group-hover:scale-105 object-cover"
                  />
                </div>
                
                {/* Project Title and Category */}
                <div className="space-y-1">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-foreground/60">
                    {project.category.toUpperCase()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;



