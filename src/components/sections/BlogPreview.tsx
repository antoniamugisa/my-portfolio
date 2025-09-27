import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const BlogPreview: React.FC = () => {
  return (
    <section id="blog" className="py-24 bg-background">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-12 gap-8">
          {/* Left side - Cards */}
          <div className="col-span-12 lg:col-span-9">
            <div className="grid md:grid-cols-2 gap-8">
          {/* Blog Link */}
          <Card className="group bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card cursor-pointer">
            <Link to="/blog" className="block p-8 text-center">
              <div className="mb-6">
                <BookOpen className="w-16 h-16 mx-auto text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">thoughts</h3>
              <p className="text-foreground/70 mb-6 leading-relaxed">
                what's been on my mind lately
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
              <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">media worth your time</h3>
              <p className="text-foreground/70 mb-6 leading-relaxed">
                what i'm watching, reading, and playing right now
              </p>
              <div className="flex items-center justify-center text-primary font-medium group-hover:translate-x-1 transition-transform">
                explore media
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </Link>
          </Card>
            </div>
          </div>

          {/* Right side - Title */}
          <div className="col-span-12 lg:col-span-3">
            <div className="sticky top-24 pb-8">
              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold font-heading mb-6 bg-gradient-primary bg-clip-text text-transparent leading-[1.2] pb-2">explore more</h2>
              <p className="text-lg text-foreground/70 leading-relaxed">a bit more info on me</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;


