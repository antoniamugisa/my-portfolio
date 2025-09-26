import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import profile from '@/assets/image.png';

type HeroProps = {
  onScrollTo: (id: string) => void;
};

const Hero: React.FC<HeroProps> = ({ onScrollTo }) => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      <div className="relative z-10 px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center animate-fade-in">
          <div className="space-y-8">
            <h1 className="text-6xl md:text-8xl font-bold leading-tight">
              <span className="block text-foreground">antonia mugisa</span>
            </h1>
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground">software engineer</h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                building functional, scalable and aesthetic software with cutting-edge technology.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-all duration-300" onClick={() => onScrollTo('projects')}>
                view my work
              </Button>
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted" onClick={() => onScrollTo('contact')}>
                get in touch
              </Button>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
              <img src={profile} alt="Profile photo" className="w-[20rem] h-[20rem] lg:w-[25rem] lg:h-[25rem] rounded-full object-cover" />
            </div>
          </div>
        </div>
      </div>
      <button onClick={() => onScrollTo('about')} className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer group">
        <div className="p-2 rounded-full bg-muted backdrop-blur-sm border border-border group-hover:bg-muted/80 transition-all duration-300">
          <ChevronDown className="w-6 h-6 text-foreground" />
        </div>
      </button>
    </section>
  );
};

export default Hero;


