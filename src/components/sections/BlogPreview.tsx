import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const BlogPreview: React.FC = () => {
  return (
    <section id="blog" className="py-24 bg-background">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">explore more</h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">dive deeper into my thoughts, experiences, and interests</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Blog Link */}
          <Card className="group bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card cursor-pointer">
            <Link to="/blog" className="block p-8 text-center">
              <div className="mb-6">
                <BookOpen className="w-16 h-16 mx-auto text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">thoughts & stories</h3>
              <p className="text-foreground/70 mb-6 leading-relaxed">
                my thoughts and observations on tech and life
              </p>
              <div className="flex items-center justify-center text-primary font-medium group-hover:translate-x-1 transition-transform">
                explore blog
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </Link>
          </Card>

          {/* Interests Link */}
          <Card className="group bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card cursor-pointer">
            <Link to="/interests" className="block p-8 text-center">
              <div className="mb-6">
                <Heart className="w-16 h-16 mx-auto text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">content worth consuming</h3>
              <p className="text-foreground/70 mb-6 leading-relaxed">
                media that is shaping my thinking
              </p>
              <div className="flex items-center justify-center text-primary font-medium group-hover:translate-x-1 transition-transform">
                explore interests
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;


