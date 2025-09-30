import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Github, Calendar, Clock, User } from 'lucide-react';
import { projects } from '@/data/portfolio';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  // Find the project by ID
  const project = projects.find(p => p.id === id);
  
  // If project not found, redirect to projects page
  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Back Button */}
      <div className="container mx-auto px-6 max-w-4xl mb-8">
        <Link to="/projects">
          <Button variant="ghost" className="group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            back to projects
          </Button>
        </Link>
      </div>

      {/* Project Header */}
      <article className="container mx-auto px-6 max-w-4xl">
        {/* Hero Image with Overlay */}
        <div className="relative aspect-[4/3] md:aspect-[21/9] min-h-[250px] md:min-h-[400px] overflow-hidden rounded-lg mb-8 shadow-card bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
          <img 
            src={project.image} 
            alt={project.title}
            className={`w-full h-full ${
              project.id === 'dal gazette app' ? 'object-contain p-8' : 'object-cover'
            }`}
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Content Overlay */}
          <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-between">
            {/* Top Right - Tags */}
            <div className="flex justify-end">
              <div className="flex flex-wrap gap-2">
                {project.tags.slice(0, 3).map((tag) => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30"
                  >
                    {tag}
                  </span>
                ))}
                {project.tags.length > 3 && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30">
                    +{project.tags.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Left - Date, Title, Subtitle */}
            <div className="space-y-2 md:space-y-3">
              {/* Date */}
              <div className="text-white/90 text-xs md:text-sm font-medium">
                {formatDate(project.date)}
              </div>
              
              {/* Title */}
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {project.title}
              </h1>
              
              {/* Subtitle/Description */}
              <p className="text-white/90 text-sm md:text-xl leading-relaxed max-w-2xl">
                {project.description}
              </p>
            </div>
          </div>
        </div>

        {/* Project Meta */}
        <div className="mb-8">
          <div className="flex items-center justify-between border-b border-border pb-6">
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {project.category}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(project.date)}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button asChild className="bg-primary hover:shadow-glow transition-all duration-300">
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Live Demo
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  View Code
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="prose prose-lg max-w-none mb-16">
          {/* Additional Project Information */}
          <div className="mb-8 p-6 bg-card rounded-lg border border-border">
            <h3 className="text-xl font-semibold mb-4 text-foreground">project details</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-foreground">category:</span>
                <span className="ml-2 text-foreground/80">{project.category}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">date:</span>
                <span className="ml-2 text-foreground/80">{formatDate(project.date)}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">status:</span>
                <span className="ml-2 text-foreground/80">completed</span>
              </div>
              <div>
                <span className="font-medium text-foreground">featured:</span>
                <span className="ml-2 text-foreground/80">{project.featured ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Technologies Used */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">technologies used</h2>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Project Tags */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">tags</h2>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Project Description */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-foreground">about this project</h2>
            <p className="text-foreground/80 leading-relaxed text-lg">
              {project.description}
            </p>
            
            {/* Long Description */}
            {project.longDescription && (
              <div className="mt-6">
                <p className="text-foreground/80 leading-relaxed text-lg whitespace-pre-line">
                  {project.longDescription}
                </p>
              </div>
            )}
          </div>


          {/* Key Features */}
          {project.keyFeatures && project.keyFeatures.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">key features</h2>
              <ul className="space-y-2">
                {project.keyFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span className="text-foreground/80 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Challenges */}
          {project.challenges && project.challenges.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">challenges</h2>
              <ul className="space-y-2">
                {project.challenges.map((challenge, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span className="text-foreground/80 leading-relaxed">{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Learnings */}
          {project.learnings && project.learnings.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">what i learned</h2>
              <ul className="space-y-2">
                {project.learnings.map((learning, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span className="text-foreground/80 leading-relaxed">{learning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Future Improvements */}
          {project.futureImprovements && project.futureImprovements.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">future improvements</h2>
              <ul className="space-y-2">
                {project.futureImprovements.map((improvement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span className="text-foreground/80 leading-relaxed">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </article>

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

export default ProjectDetail;
