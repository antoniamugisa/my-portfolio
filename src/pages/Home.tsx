import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Code, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-bg.jpg';

const Home = () => {
  const scrollToSection = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Antonia 
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Software Developer
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/80 mb-8 leading-relaxed">
            Crafting beautiful digital experiences with the precision of code
            <br />
            and the creativity of anime aesthetics
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/projects">
              <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                <Code className="w-5 h-5 mr-2" />
                View My Work
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="border-primary/50 hover:bg-primary/10 transition-all duration-300">
                Get In Touch
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToSection}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-foreground/60 hover:text-primary transition-colors duration-300 animate-bounce"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              What I Do
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Blending technical expertise with creative vision to build exceptional digital experiences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Code className="w-8 h-8" />,
                title: "Full-Stack Development",
                description: "Building end-to-end applications with modern technologies and best practices"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Performance Optimization",
                description: "Creating lightning-fast applications that deliver exceptional user experiences"
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "Creative Solutions",
                description: "Innovative approaches to complex problems with attention to aesthetic detail"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card"
              >
                <div className="text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-foreground/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;