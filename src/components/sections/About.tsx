import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { certifications, skills, education } from '@/data/portfolio';

const About: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-24 pb-24 md:pb-24 bg-secondary">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="grid grid-cols-12 gap-4 md:gap-8">
          {/* Left side - Title */}
          <div className="col-span-12 lg:col-span-3 order-1 lg:order-1">
            <div className="sticky top-16 md:top-24 pb-4 md:pb-8">
              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold font-heading mb-6 bg-primary bg-clip-text text-transparent leading-[1.2] pb-2">about me</h2>
              <p className="text-lg text-foreground/70 leading-relaxed">a passionate developer who bridges the gap between technical excellence and creative expression</p>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="col-span-12 lg:col-span-9 order-2 lg:order-2">
            <div className="space-y-16">
              <div className="space-y-8">
                <h3 className="text-3xl font-bold text-center mb-8">my journey</h3>
                <div className="space-y-6 text-lg text-foreground/80 leading-relaxed">
                  <p>
                    hello! i'm Antonia, a software developer who thrives at the intersection of thoughtful engineering and creative problem-solving. my journey began in highschool when I joined my school's robotics team and learnt how to make a robot move forward and backwards. I decided then and there I want to do more of this, and my interest grew into a career where I get to design, build, and optimize full-stack applications that make a real impact.
                  </p>
                  <p>
                    over the years, I've worked on everything from AI-powered tools to cloud-native systems and intuitive web interfaces. I believe that great software goes beyond functionality. It should feel effortless, efficient, and user-first.
                  </p>
                  <p>
                    when I'm not immersed in code, you'll find me exploring the city with my friends, climbing at my local climbing gym and experimenting with new technologies. This blend of technical skill and creative passion drives me to build applications that are both powerful and beautiful.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-center mb-8">education</h3>
                <div className="grid gap-4">
                  {education.map((edu, index) => (
                    <Card key={index} className="p-6 bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300">
                      <div className="space-y-2 text-center">
                        <h4 className="font-semibold text-lg text-primary">{edu.degree}</h4>
                        <p className="text-foreground/70">{edu.institution}</p>
                        <p className="text-sm text-foreground/50">{edu.duration}</p>
                        <p className="text-foreground/80">{edu.description}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-center mb-8">i know these pretty well</h3>
                <Card className="p-8 bg-secondary border-border/50">
                  <div className="flex flex-wrap gap-3 justify-center">
                    {skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-4 py-2 text-sm font-medium bg-card hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all duration-300 cursor-default">{skill}</Badge>
                    ))}
                  </div>
                </Card>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-center mb-8">certs, certs and more certs</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {certifications.map((cert, index) => (
                    <Card key={index} className="p-6 bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg text-primary">{cert.name}</h4>
                        <p className="text-foreground/70">{cert.issuer}</p>
                        <p className="text-sm text-foreground/50">{cert.year}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;


