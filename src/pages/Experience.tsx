import React from 'react';
import ExperienceSection from '@/components/sections/Experience';

const Experience = () => {
  return (
    <div className="min-h-screen bg-background md:ml-56 md:mr-32 pt-24 md:pt-16">
      {/* Experience Section */}
      <ExperienceSection />

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

export default Experience;

