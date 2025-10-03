import React from 'react';
import { Button } from '@/components/ui/button';
import { Github, Linkedin, Mail, Download } from 'lucide-react';
import { XLogo } from '@/components/ui/x-logo';
import profile from '@/assets/profile.jpeg';

type HeroProps = {
  onScrollTo: (id: string) => void;
};

const Hero: React.FC<HeroProps> = ({ onScrollTo }) => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-4 md:pt-0 pb-24 md:pb-0">
      <div className="relative z-10 px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center animate-fade-in">
          <div className="space-y-8 text-center lg:text-left">
            <h1 className="text-6xl md:text-8xl font-bold font-heading leading-tight">
              <span className="block text-foreground">Antonia Mugisa</span>
            </h1>
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground">Software Engineer</h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Building functional, scalable and aesthetic software with cutting-edge technology.
              </p>
              <div className="flex gap-4 pt-4 justify-center lg:justify-start">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-muted transition-colors duration-300">
                  <Github className="w-6 h-6 text-foreground hover:text-primary transition-colors duration-300" />
                </a>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-muted transition-colors duration-300">
                  <XLogo className="w-6 h-6 text-foreground hover:text-primary transition-colors duration-300" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-muted transition-colors duration-300">
                  <Linkedin className="w-6 h-6 text-foreground hover:text-primary transition-colors duration-300" />
                </a>
                <a href="mailto:antoniamugisa@gmail.com" className="p-2 rounded-full hover:bg-muted transition-colors duration-300">
                  <Mail className="w-6 h-6 text-foreground hover:text-primary transition-colors duration-300" />
                </a>
                <a href="/resume.pdf" download="Antonia_Mugisa_Resume.pdf" className="p-2 rounded-full hover:bg-muted transition-colors duration-300" title="Download Resume">
                  <Download className="w-6 h-6 text-foreground hover:text-primary transition-colors duration-300" />
                </a>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-8 justify-center lg:justify-start">
              <Button size="lg" className="bg-primary hover:shadow-glow transition-all duration-300" onClick={() => onScrollTo('projects')}>
                View My Work
              </Button>
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted" onClick={() => onScrollTo('contact')}>
                Get In Touch
              </Button>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="rounded-full">
              <img src={profile} alt="Profile photo" className="w-[20rem] h-[20rem] lg:w-[25rem] lg:h-[25rem] rounded-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;



