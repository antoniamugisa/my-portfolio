import React from 'react';
import Hero from '@/components/sections/Hero';

import Experience from '@/components/sections/Experience';
import Projects from '@/components/sections/Projects';
import Contact from '@/components/sections/Contact';

const Index = () => {
  const [selectedFilter, setSelectedFilter] = React.useState('All');

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // (Content moved to section components and data modules)

  return (
    <div className="min-h-screen md:ml-56 md:mr-32">
      <Hero onScrollTo={scrollToSection} />

      {/* Video above Experience section - right aligned with sidebar */}
      <div className="hidden md:block relative -mb-20">
        <div className="absolute right-0 top-0 z-10">
          <video
            src="/videos/Cats_Appear_Video_Ready.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-24 rounded-lg border border-border/40 shadow-lg"
          />
        </div>
      </div>

      <Experience />

      <Projects selectedFilter={selectedFilter} onSelectFilter={setSelectedFilter} />


      <Contact />

      {/* Footer */}
      <footer className="py-6 bg-background pb-16 md:pb-6">
        <div className="container mx-auto px-6 flex flex-col items-center gap-2 text-center md:flex-row md:justify-between md:text-left">
          <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground/70 bg-background/60">
            Version: <span className="ml-1 font-semibold">v3</span> | Last updated: <span className="ml-1 font-semibold">18/12/2025</span>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Index;