import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { certifications, interests, skills } from '@/data/portfolio';

const About: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-gradient-secondary">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">About Me</h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">A passionate developer who bridges the gap between technical excellence and creative expression</p>
        </div>

        <div className="space-y-16">
          <div className="space-y-8">
            <h3 className="text-3xl font-bold text-center mb-8">My Journey</h3>
            <div className="space-y-6 text-lg text-foreground/80 leading-relaxed">
              <p>
                Hi! I'm Antonia, a software developer who thrives at the intersection of thoughtful engineering and creative problem-solving. My journey began in highschool when I joined my school's robotics team and learnt how to make a robot move forward and backwards. I decided then and there I want to do more of this, and my interest grew into a career where I get to design, build, and optimize full-stack applications that make a real impact.
              </p>
              <p>
                Over the years, I've worked on everything from AI-powered tools to cloud-native systems and intuitive web interfaces. I believe that great software goes beyond functionality. It should feel effortless, efficient, and user-first.
              </p>
              <p>
                When I'm not immersed in code, you'll find me exploring the city with my friends, climbing at my local climbing gym and experimenting with new technologies. This blend of technical skill and creative passion drives me to build applications that are both powerful and beautiful.
              </p>
            </div>
          </div>


          <div>
            <h3 className="text-3xl font-bold text-center mb-8">Technical Arsenal</h3>
            <Card className="p-8 bg-gradient-secondary border-border/50">
              <div className="flex flex-wrap gap-3 justify-center">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="px-4 py-2 text-sm font-medium bg-card hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all duration-300 cursor-default">{skill}</Badge>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-center mb-8">Certifications</h3>
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
          
          <div>
            <h3 className="text-3xl font-bold text-center mb-8">Beyond the Code</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {interests.map((interest, index) => (
                <Card key={index} className="p-6 bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    <div className="text-primary group-hover:scale-110 transition-transform duration-300">{interest.icon}</div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">{interest.title}</h4>
                      <p className="text-foreground/70">{interest.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-3xl font-bold mb-8">Development Philosophy</h3>
            <Card className="p-8 bg-gradient-secondary border-border/50">
              <blockquote className="text-xl italic text-foreground/80 leading-relaxed">
                "Code is poetry written in logic. Every function, every component, every algorithm should not only solve a problem but tell a story. Great software weaves together technical precision with emotional resonance."
              </blockquote>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;


