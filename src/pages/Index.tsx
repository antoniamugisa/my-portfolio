import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Experience from '@/components/sections/Experience';
import Projects from '@/components/sections/Projects';
import BlogPreview from '@/components/sections/BlogPreview';
import Contact from '@/components/sections/Contact';

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

  // (Content moved to section components and data modules)

  return (
    <div className="min-h-screen">
      <Hero onScrollTo={scrollToSection} />

      <About />

      <Experience />

      <Projects selectedFilter={selectedFilter} onSelectFilter={setSelectedFilter} />

      <BlogPreview />

      <Contact isSubmitting={isSubmitting} onSubmit={handleSubmit} />

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <p className="text-foreground/70 text-sm">
            © 2025 Antonia Mugisa. 
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;