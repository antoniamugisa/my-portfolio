import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Filter } from 'lucide-react';

const Projects = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');

  const projects = [
    {
      title: "Anime Dev Space Portfolio",
      description: "A modern, responsive portfolio website showcasing my development journey with an anime-inspired design. Features include dynamic project showcases, blog integration, and a sleek UI built with React and TypeScript.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
      technologies: ["React", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui", "React Router"],
      category: "Frontend",
      demoUrl: "#",
      githubUrl: "https://github.com/antoniamugisa/anime-dev-space",
      featured: true
    },
    {
      title: "E-Commerce Platform",
      description: "A full-stack e-commerce solution with React frontend, Node.js backend, and Stripe integration. Features include user authentication, product management, shopping cart, and payment processing.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600",
      technologies: ["React", "Node.js", "PostgreSQL", "Stripe", "AWS"],
      category: "Full-Stack",
      demoUrl: "#",
      githubUrl: "#",
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
    {
      title: "Real-time Chat Application",
      description: "Modern chat application with real-time messaging, file sharing, and video calls. Features include group chats, emoji reactions, and message encryption for secure communication.",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600",
      technologies: ["React", "Socket.io", "Node.js", "WebRTC", "Redis"],
      category: "Frontend",
      demoUrl: "#",
      githubUrl: "#",
      featured: false
    },
    {
      title: "Task Management API",
      description: "RESTful API for task management with user authentication, role-based permissions, and comprehensive documentation. Includes automated testing and CI/CD pipeline.",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600",
      technologies: ["Node.js", "Express", "MongoDB", "JWT", "Jest"],
      category: "Backend",
      demoUrl: "#",
      githubUrl: "#",
      featured: false
    },
    {
      title: "Data Visualization Dashboard",
      description: "Interactive dashboard for visualizing complex datasets with dynamic charts, filters, and real-time updates. Built for analyzing business metrics and KPIs.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
      technologies: ["React", "D3.js", "Python", "FastAPI", "PostgreSQL"],
      category: "Frontend",
      demoUrl: "#",
      githubUrl: "#",
      featured: false
    },
    {
      title: "Microservices Architecture",
      description: "Scalable microservices system with Docker containers, API gateway, and service discovery. Includes monitoring, logging, and automated deployment strategies.",
      image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600",
      technologies: ["Docker", "Kubernetes", "Node.js", "Redis", "NGINX"],
      category: "Backend",
      demoUrl: "#",
      githubUrl: "#",
      featured: false
    }
  ];

  const categories = ['All', 'Full-Stack', 'Frontend', 'Backend', 'Machine Learning'];

  const filteredProjects = selectedFilter === 'All' 
    ? projects 
    : projects.filter(project => project.category === selectedFilter);

  const featuredProjects = projects.filter(project => project.featured);

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold font-heading mb-6 bg-gradient-primary bg-clip-text text-transparent leading-[1.2] pb-2">
            Projects
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
            A showcase of my technical skills and creative solutions
          </p>
        </div>

        {/* Featured Projects */}
        {selectedFilter === 'All' && (
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Projects</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {featuredProjects.map((project, index) => (
                <Card
                  key={index}
                  className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-500 hover:shadow-card"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">
                        {project.title}
                      </h3>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {project.category}
                      </Badge>
                    </div>
                    
                    <p className="text-foreground/80 leading-relaxed mb-6">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.technologies.map((tech, techIndex) => (
                        <Badge
                          key={techIndex}
                          variant="outline"
                          className="text-xs border-border/50 hover:border-primary/50 transition-colors"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-3">
                      <Button size="sm" className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Live Demo
                      </Button>
                      <Button variant="outline" size="sm" className="border-border/50 hover:border-primary/50">
                        <Github className="w-4 h-4 mr-2" />
                        Code
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <div className="flex items-center gap-2 text-foreground/70 mr-4">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter by:</span>
          </div>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedFilter === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(category)}
              className={`transition-all duration-300 ${
                selectedFilter === category
                  ? 'bg-gradient-primary shadow-glow'
                  : 'border-border/50 hover:border-primary/50'
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* All Projects Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <Card
              key={index}
              className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-500 hover:shadow-card h-full flex flex-col"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                    {project.title}
                  </h3>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                    {project.category}
                  </Badge>
                </div>
                
                <p className="text-foreground/80 text-sm leading-relaxed mb-4 flex-grow">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.technologies.slice(0, 3).map((tech, techIndex) => (
                    <Badge
                      key={techIndex}
                      variant="outline"
                      className="text-xs border-border/50"
                    >
                      {tech}
                    </Badge>
                  ))}
                  {project.technologies.length > 3 && (
                    <Badge variant="outline" className="text-xs border-border/50">
                      +{project.technologies.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Demo
                  </Button>
                  <Button variant="outline" size="sm" className="border-border/50 hover:border-primary/50">
                    <Github className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-foreground/60 text-lg">No projects found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;