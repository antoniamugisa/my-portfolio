import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Filter, ArrowLeft } from 'lucide-react';
import { projects } from '@/data/portfolio';

const Projects = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).toUpperCase();
  };

  const categories = ['All', 'Full-Stack', 'Frontend', 'Backend', 'Machine Learning'];

  const filteredProjects = selectedFilter === 'All' 
    ? projects 
    : projects.filter(project => project.category === selectedFilter);

  const featuredProjects = projects.filter(project => project.featured);

  return (
    <div className="min-h-screen bg-background pt-4 md:pt-24">
      {/* Back Button */}
      <div className="container mx-auto px-4 md:px-6 max-w-7xl mb-8">
        <Link to="/">
          <Button variant="ghost" className="group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            back to home
          </Button>
        </Link>
      </div>

      {/* Main Layout */}
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-4 md:gap-8">
          {/* Left Side - Title Section */}
          <div className="lg:col-span-3 py-4 md:py-16">
            <div className="sticky top-16 md:top-32 pb-4 md:pb-16">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold font-heading mb-4 md:mb-6 bg-primary bg-clip-text text-transparent leading-[1.2] pb-2">
                projects
              </h1>
              <p className="text-lg text-foreground/70 leading-relaxed">
                a showcase of my technical skills and creative solutions
              </p>
            </div>
          </div>

          {/* Right Side - Content Section */}
          <div className="lg:col-span-9">



            {/* Projects Grid with Card Design */}
            <section className="py-4 md:py-16">
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                {filteredProjects.map((project, index) => (
                  <div key={project.id} className="py-px">
                    <Link to={`/projects/${project.id}`}>
                      <div 
                        className="group bg-card border border-border rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-card"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Project Image */}
                        <div className="aspect-video overflow-hidden">
                          <img 
                            src={project.image} 
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* Project Content */}
                        <div className="p-4 md:p-6">
                          {/* Title with Action Icons */}
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg md:text-xl font-bold text-foreground leading-tight flex-1 pr-2">
                              {project.title}
                            </h3>
                            <div className="flex gap-2 flex-shrink-0">
                              {project.demoUrl !== "#" && (
                                <div className="w-4 h-4 text-muted-foreground">
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
                                  </svg>
                                </div>
                              )}
                              {project.githubUrl !== "#" && (
                                <div className="w-4 h-4 text-muted-foreground">
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Description */}
                          <p className="text-foreground/80 text-sm md:text-base leading-relaxed mb-4">
                            {project.description}
                          </p>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag) => (
                              <span 
                                key={tag}
                                className="px-2 py-1 bg-muted text-foreground text-xs rounded-md border border-border"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {filteredProjects.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-foreground/60 text-lg">no projects found in this category.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border pb-24 md:pb-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-foreground/70 text-sm">
            © 2025 Antonia Mugisa. Built with React, TypeScript & Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Projects;