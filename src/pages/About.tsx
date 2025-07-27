import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Heart, Coffee, Gamepad2, Code2 } from 'lucide-react';

const About = () => {
  const skills = [
    'React', 'TypeScript', 'Node.js', 'Python', 'Next.js', 'Tailwind CSS',
    'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'GraphQL'
  ];

  const interests = [
    { icon: <Code2 className="w-5 h-5" />, title: 'Coding', desc: 'Passionate about clean, efficient code' },
    { icon: <Gamepad2 className="w-5 h-5" />, title: 'Anime & Gaming', desc: 'Drawing inspiration from digital art' },
    { icon: <Coffee className="w-5 h-5" />, title: 'Coffee', desc: 'Fueling late-night coding sessions' },
    { icon: <Heart className="w-5 h-5" />, title: 'Open Source', desc: 'Contributing to the developer community' }
  ];

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            About Me
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
            A passionate developer who bridges the gap between technical excellence and creative expression
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-16">
          {/* Story Section */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center mb-8">My Journey</h2>
            <div className="space-y-6 text-lg text-foreground/80 leading-relaxed">
              <p>
                Welcome to my digital realm! I'm a software developer who found my calling at the intersection 
                of code and creativity. My journey began with a simple fascination for how technology could 
                bring imaginative worlds to life—much like the anime that inspired my aesthetic sense.
              </p>
              <p>
                With several years of experience in full-stack development, I've worked on everything from 
                responsive web applications to complex backend systems. I believe that great software isn't 
                just about functionality—it's about creating experiences that resonate with users on an 
                emotional level.
              </p>
              <p>
                When I'm not immersed in code, you'll find me exploring the latest anime series, gaming, 
                or experimenting with new technologies. This blend of technical skill and creative passion 
                drives me to build applications that are both powerful and beautiful.
              </p>
            </div>
          </div>

          {/* Skills Section */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-8">Technical Arsenal</h2>
            <Card className="p-8 bg-gradient-secondary border-border/50">
              <div className="flex flex-wrap gap-3 justify-center">
                {skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-4 py-2 text-sm font-medium bg-card hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all duration-300 cursor-default"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          {/* Interests Section */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-8">Beyond the Code</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {interests.map((interest, index) => (
                <Card
                  key={index}
                  className="p-6 bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-primary group-hover:scale-110 transition-transform duration-300">
                      {interest.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{interest.title}</h3>
                      <p className="text-foreground/70">{interest.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Philosophy Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">Development Philosophy</h2>
            <Card className="p-8 bg-gradient-secondary border-border/50">
              <blockquote className="text-xl italic text-foreground/80 leading-relaxed">
                "Code is poetry written in logic. Every function, every component, every algorithm 
                should not only solve a problem but tell a story. Like the carefully crafted narratives 
                in anime, great software weaves together technical precision with emotional resonance."
              </blockquote>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;