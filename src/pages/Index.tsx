import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ChevronDown, 
  Code2, 
  Gamepad2, 
  Coffee, 
  Heart,
  Calendar, 
  MapPin, 
  Briefcase,
  ExternalLink, 
  Github, 
  Filter,
  Mail, 
  Phone,
  Linkedin, 
  Twitter, 
  Send,
  Zap,
  Palette
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-bg.jpg';

const Index = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent!",
      description: "Thank you for reaching out. I'll get back to you soon!",
    });
    
    setIsSubmitting(false);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Data
  const skills = [
    'React', 'TypeScript', 'Node.js', 'Python', 'Next.js', 'Tailwind CSS',
    'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'GraphQL'
  ];

  const certifications = [
    { name: 'AWS Certified Developer', issuer: 'Amazon Web Services', year: '2023' },
    { name: 'React Professional Certificate', issuer: 'Meta', year: '2023' },
    { name: 'JavaScript Algorithms and Data Structures', issuer: 'freeCodeCamp', year: '2022' },
    { name: 'Google Cloud Professional Developer', issuer: 'Google Cloud', year: '2022' }
  ];

  const interests = [
    { icon: <Code2 className="w-5 h-5" />, title: 'Coding', desc: 'Passionate about clean, efficient code' },
    { icon: <Gamepad2 className="w-5 h-5" />, title: 'Anime & Gaming', desc: 'Drawing inspiration from digital art' },
    { icon: <Coffee className="w-5 h-5" />, title: 'Coffee', desc: 'Fueling late-night coding sessions' },
    { icon: <Heart className="w-5 h-5" />, title: 'Open Source', desc: 'Contributing to the developer community' }
  ];

  const experiences = [
    {
      company: "TechCorp Solutions",
      position: "Senior Full-Stack Developer",
      duration: "2022 - Present",
      location: "Remote",
      description: "Leading development of scalable web applications using React, Node.js, and cloud technologies. Mentoring junior developers and implementing best practices for code quality and performance.",
      achievements: [
        "Reduced application load time by 40% through optimization",
        "Led a team of 5 developers on a major product redesign",
        "Implemented CI/CD pipeline that improved deployment efficiency by 60%"
      ],
      technologies: ["React", "TypeScript", "Node.js", "AWS", "PostgreSQL", "Docker"]
    },
    {
      company: "Digital Innovations Inc",
      position: "Frontend Developer",
      duration: "2020 - 2022",
      location: "San Francisco, CA",
      description: "Developed responsive user interfaces and collaborated with UX/UI designers to create engaging user experiences. Focused on modern frontend technologies and accessibility standards.",
      achievements: [
        "Built 15+ responsive web applications from scratch",
        "Improved accessibility score by 35% across all projects",
        "Mentored 3 interns and junior developers"
      ],
      technologies: ["React", "JavaScript", "SCSS", "Webpack", "Jest", "Figma"]
    },
    {
      company: "StartupLab",
      position: "Junior Developer",
      duration: "2019 - 2020",
      location: "Austin, TX",
      description: "Started my professional journey building dynamic web applications and learning industry best practices. Contributed to multiple client projects while rapidly expanding technical skills.",
      achievements: [
        "Delivered 8 client projects on time and within budget",
        "Learned 5 new technologies in the first 6 months",
        "Received 'Rising Star' award for exceptional growth"
      ],
      technologies: ["HTML", "CSS", "JavaScript", "PHP", "MySQL", "WordPress"]
    }
  ];

  const education = [
    {
      institution: "University of Technology",
      degree: "Bachelor of Science in Computer Science",
      duration: "2015 - 2019",
      description: "Graduated Magna Cum Laude with focus on software engineering and algorithms.",
      highlights: ["GPA: 3.8/4.0", "Dean's List: 6 semesters", "Programming Club President"]
    }
  ];

  const projects = [
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

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5" />,
      label: "Email",
      value: "hello@developer.com",
      href: "mailto:hello@developer.com"
    },
    {
      icon: <Phone className="w-5 h-5" />,
      label: "Phone",
      value: "+1 (555) 123-4567",
      href: "tel:+15551234567"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: "Location",
      value: "San Francisco, CA",
      href: "#"
    }
  ];

  const socialLinks = [
    {
      icon: <Github className="w-5 h-5" />,
      label: "GitHub",
      href: "https://github.com",
      color: "hover:text-foreground"
    },
    {
      icon: <Linkedin className="w-5 h-5" />,
      label: "LinkedIn",
      href: "https://linkedin.com",
      color: "hover:text-blue-400"
    },
    {
      icon: <Twitter className="w-5 h-5" />,
      label: "Twitter",
      href: "https://twitter.com",
      color: "hover:text-blue-400"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-subtle" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-6xl md:text-8xl font-bold leading-tight">
              <span className="block text-foreground/90">Welcome to</span>
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                My Digital Realm
              </span>
            </h1>
            
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground/80">
                Software Developer
              </h2>
              <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
                Crafting beautiful, functional applications with cutting-edge technology and creative flair
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                onClick={() => scrollToSection('projects')}
              >
                View My Work
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white/20 text-foreground hover:bg-white/10"
                onClick={() => scrollToSection('contact')}
              >
                Get In Touch
              </Button>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => scrollToSection('about')}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer group"
        >
          <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
            <ChevronDown className="w-6 h-6 text-white" />
          </div>
        </button>
      </section>

      {/* What I Do Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              What I Do
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Combining technical expertise with creative vision to deliver exceptional digital experiences
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Code2 className="w-8 h-8" />,
                title: "Full-Stack Development",
                description: "Building scalable applications from frontend to backend with modern technologies and best practices."
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Performance Optimization",
                description: "Enhancing user experience through code optimization, caching strategies, and performance monitoring."
              },
              {
                icon: <Palette className="w-8 h-8" />,
                title: "Creative Solutions",
                description: "Designing intuitive interfaces and solving complex problems with innovative approaches."
              }
            ].map((feature, index) => (
              <Card 
                key={index}
                className="p-8 text-center bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card group"
              >
                <div className="text-primary mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-foreground/70 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gradient-secondary">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              About Me
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              A passionate developer who bridges the gap between technical excellence and creative expression
            </p>
          </div>

          <div className="space-y-16">
            {/* Story Section */}
            <div className="space-y-8">
              <h3 className="text-3xl font-bold text-center mb-8">My Journey</h3>
              <div className="space-y-6 text-lg text-foreground/80 leading-relaxed">
                <p>
                  Welcome to my digital realm! I'm a software developer who found my calling at the intersection 
                  of code and creativity. My journey began with a simple fascination for how technology could 
                  bring imaginative worlds to life—much like the anime that inspired my aesthetic sense.
                </p>
                <p>
                  With several years of experience in full-stack development, I've worked on everything from 
                  responsive web applications to complex backend systems. I believe that great software isn't 
                  just about functionality—it's about creating experiences that resonate with users on an 
                  emotional level.
                </p>
                <p>
                  When I'm not immersed in code, you'll find me exploring the latest anime series, gaming, 
                  or experimenting with new technologies. This blend of technical skill and creative passion 
                  drives me to build applications that are both powerful and beautiful.
                </p>
              </div>
            </div>

            {/* Skills Section */}
            <div>
              <h3 className="text-3xl font-bold text-center mb-8">Technical Arsenal</h3>
              <Card className="p-8 bg-gradient-secondary border-border/50">
                <div className="flex flex-wrap gap-3 justify-center">
                  {skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-4 py-2 text-sm font-medium bg-card hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all duration-300 cursor-default"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>

            {/* Certifications Section */}
            <div>
              <h3 className="text-3xl font-bold text-center mb-8">Certifications</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {certifications.map((cert, index) => (
                  <Card
                    key={index}
                    className="p-6 bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="space-y-2">
                      <h4 className="font-semibold text-lg text-primary">{cert.name}</h4>
                      <p className="text-foreground/70">{cert.issuer}</p>
                      <p className="text-sm text-foreground/50">{cert.year}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Interests Section */}
            <div>
              <h3 className="text-3xl font-bold text-center mb-8">Beyond the Code</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {interests.map((interest, index) => (
                  <Card
                    key={index}
                    className="p-6 bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-primary group-hover:scale-110 transition-transform duration-300">
                        {interest.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg mb-2">{interest.title}</h4>
                        <p className="text-foreground/70">{interest.desc}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Philosophy Section */}
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-8">Development Philosophy</h3>
              <Card className="p-8 bg-gradient-secondary border-border/50">
                <blockquote className="text-xl italic text-foreground/80 leading-relaxed">
                  "Code is poetry written in logic. Every function, every component, every algorithm 
                  should not only solve a problem but tell a story. Like the carefully crafted narratives 
                  in anime, great software weaves together technical precision with emotional resonance."
                </blockquote>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Experience
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              My professional journey through the world of software development
            </p>
          </div>

          {/* Experience Timeline */}
          <div className="space-y-8 mb-16">
            <h3 className="text-3xl font-bold text-center mb-12">Professional Experience</h3>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-primary transform md:-translate-x-1/2"></div>
              
              <div className="space-y-12">
                {experiences.map((exp, index) => (
                  <div
                    key={index}
                    className={`relative flex flex-col md:flex-row items-start md:items-center ${
                      index % 2 === 0 ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-2 md:left-1/2 w-4 h-4 bg-primary rounded-full transform md:-translate-x-1/2 border-4 border-background shadow-glow"></div>
                    
                    {/* Content */}
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
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {exp.duration}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {exp.location}
                          </span>
                        </div>
                        
                        <p className="text-foreground/80 mb-4 leading-relaxed">{exp.description}</p>
                        
                        <div className="space-y-4">
                          <div>
                            <h6 className="font-semibold mb-2">Key Achievements:</h6>
                            <ul className="space-y-1 text-foreground/80">
                              {exp.achievements.map((achievement, achIndex) => (
                                <li key={achIndex} className="flex items-start">
                                  <span className="text-primary mr-2">•</span>
                                  {achievement}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h6 className="font-semibold mb-2">Technologies:</h6>
                            <div className="flex flex-wrap gap-2">
                              {exp.technologies.map((tech, techIndex) => (
                                <Badge
                                  key={techIndex}
                                  variant="secondary"
                                  className="text-xs bg-primary/10 text-primary border-primary/20"
                                >
                                  {tech}
                                </Badge>
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

          {/* Education Section */}
          <div className="space-y-8">
            <h3 className="text-3xl font-bold text-center mb-12">Education</h3>
            
            {education.map((edu, index) => (
              <Card
                key={index}
                className="p-8 bg-gradient-secondary border-border/50 hover:border-primary/50 transition-all duration-300"
              >
                <div className="text-center space-y-4">
                  <h4 className="text-2xl font-bold text-primary">{edu.degree}</h4>
                  <h5 className="text-xl font-semibold">{edu.institution}</h5>
                  <p className="text-foreground/70">{edu.duration}</p>
                  <p className="text-foreground/80 leading-relaxed max-w-2xl mx-auto">{edu.description}</p>
                  
                  <div className="flex flex-wrap justify-center gap-4 pt-4">
                    {edu.highlights.map((highlight, hIndex) => (
                      <Badge
                        key={hIndex}
                        variant="outline"
                        className="border-primary/50 text-primary"
                      >
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-24 bg-gradient-secondary">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Projects
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              A showcase of my technical skills and creative solutions
            </p>
          </div>

          {/* Featured Projects */}
          {selectedFilter === 'All' && (
            <div className="mb-20">
              <h3 className="text-3xl font-bold text-center mb-12">Featured Projects</h3>
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
                        <h4 className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">
                          {project.title}
                        </h4>
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
            </div>
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
                    <h4 className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                      {project.title}
                    </h4>
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
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Get In Touch
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              Let's collaborate and bring your ideas to life
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="p-8 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card">
              <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Your first name"
                      required
                      className="bg-background border-border focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Your last name"
                      required
                      className="bg-background border-border focus:border-primary/50"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    className="bg-background border-border focus:border-primary/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="What's this about?"
                    required
                    className="bg-background border-border focus:border-primary/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell me about your project or idea..."
                    required
                    rows={6}
                    className="bg-background border-border focus:border-primary/50 resize-none"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Details */}
              <Card className="p-8 bg-gradient-secondary border-border/50">
                <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="text-primary">{info.icon}</div>
                      <div>
                        <p className="font-medium">{info.label}</p>
                        <a
                          href={info.href}
                          className="text-foreground/80 hover:text-primary transition-colors"
                        >
                          {info.value}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Social Links */}
              <Card className="p-8 bg-card border-border hover:border-primary/50 transition-all duration-300">
                <h3 className="text-2xl font-bold mb-6">Follow Me</h3>
                <div className="flex space-x-6">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 rounded-lg bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:scale-110 ${social.color}`}
                      title={social.label}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </Card>

              {/* Availability */}
              <Card className="p-8 bg-card border-border">
                <h3 className="text-2xl font-bold mb-4">Availability</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Freelance Projects</span>
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                      Available
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Full-time Positions</span>
                    <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium">
                      Open to offers
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Consultation</span>
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                      Available
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <Card className="p-8 bg-gradient-secondary border-border/50 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Ready to Start a Project?</h3>
              <p className="text-foreground/80 mb-6 leading-relaxed">
                Whether you have a clear vision or just an idea, I'm here to help bring it to life. 
                Let's discuss how we can work together to create something amazing.
              </p>
              <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                <Mail className="w-5 h-5 mr-2" />
                Start a Conversation
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;