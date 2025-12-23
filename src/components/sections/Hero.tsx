import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Download } from 'lucide-react';
import { XLogo } from '@/components/ui/x-logo';

type HeroProps = {
  onScrollTo: (id: string) => void;
};

const Hero: React.FC<HeroProps> = ({ onScrollTo }) => {
  return (
    <section id="home" className="relative min-h-screen bg-background py-24 md:pt-12 md:pb-24">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="space-y-12">
          {/* Name and Tagline */}
          <div className="space-y-5">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold font-heading bg-primary bg-clip-text text-transparent leading-[1.1]">
              Antonia Mugisa
            </h1>

            <p className="text-lg md:text-xl text-foreground/60 leading-relaxed -mt-1">
              Software engineer who loves shipping thoughtful, well-crafted tools from AI-powered systems to interfaces that feel as good as they look.
            </p>
          </div>

          {/* CURRENTLY Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/60">CURRENTLY</h2>
            <ul className="space-y-2 text-sm md:text-base text-foreground leading-relaxed">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Building document intelligence and immigration automation at <strong>Compass Visas.</strong></span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Experimenting with <strong>ML</strong>, <strong>NLP</strong>, <strong>RAG</strong>, <strong>vector search</strong>, and playful side projects.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Trying to send fewer 'this is a silly idea but hear me out' messages...and usually failing.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Eating delicious food in Uganda on holiday with my family.</span>
              </li>
            </ul>
          </div>

          {/* A FEW THINGS I'VE DONE Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/60">A FEW THINGS I'VE DONE</h2>
            <ul className="space-y-2 text-sm md:text-base text-foreground leading-relaxed">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Shipped AI-powered tools that cut search and sorting time for legal teams by hours each week at <strong>Avanade.</strong></span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Helped migrate large workloads to Azure and automate infra with Terraform, Docker, and Kubernetes for <strong>Microsoft.</strong></span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Built interfaces that make complex systems feel simple for non-technical users.</span>
              </li>
             
            </ul>
          </div>

          {/* Buttons */}
          <div className="space-y-6 pt-1">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/projects"
                className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 font-normal text-sm md:text-base border-none rounded-md transition-colors text-center"
              >
                View Projects
              </Link>
              <a 
                href="mailto:antoniamugisa@gmail.com"
                className="px-6 py-3 bg-background border border-border text-foreground font-normal text-sm md:text-base hover:bg-secondary rounded-md transition-colors text-center"
              >
                Get In Touch
              </a>
            </div>
            
            {/* Social Media Icons */}
            <div className="flex gap-5 justify-center md:justify-start">
              <a 
                href="https://github.com/antoniamugisa" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <Github className="w-5 h-5 text-foreground" />
              </a>
              <a 
                href="https://www.linkedin.com/in/antoniamugisa/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <Linkedin className="w-5 h-5 text-foreground" />
              </a>
              <a 
                href="https://x.com/antmugisa" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <XLogo className="w-5 h-5 text-foreground" />
              </a>
              <a 
                href="/resume.pdf" 
                download="Antonia_Mugisa_Resume.pdf" 
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                title="Download Resume"
              >
                <Download className="w-5 h-5 text-foreground" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

