import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { sendEmail, EmailData } from '@/lib/emailService';
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
    
    try {
      // Get form data
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      
      const emailData: EmailData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        subject: formData.get('subject') as string,
        message: formData.get('message') as string,
      };

      // Send email
      const success = await sendEmail(emailData);
      
      if (success) {
        toast({
          title: "Message sent!",
          description: "Thank you for reaching out. I'll get back to you soon!",
        });
        
        // Reset form
        form.reset();
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Sorry, there was an error sending your message. Please try again or contact me directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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