import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const BlogPreview: React.FC = () => {
  return (
    <section id="blog" className="py-16 md:py-24 pb-24 md:pb-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="grid grid-cols-12 gap-4 md:gap-8">
          {/* Left side - Cards */}
          <div className="col-span-12 lg:col-span-9 order-2 lg:order-1">
            <div className="grid md:grid-cols-2 gap-4 md:gap-8">
          {/* Blog Link */}
          <Card className="group bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card cursor-pointer">
            <Link to="/blog" className="block p-8 text-center">
              <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">Thoughts</h3>
              <p className="text-foreground/70 mb-6 leading-relaxed">
                What's been on my mind lately
              </p>
              <div className="flex items-center justify-center text-primary font-medium group-hover:translate-x-1 transition-transform">
                Explore Blog
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </Link>
          </Card>

          {/* Interests Link */}
          <Card className="group bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card cursor-pointer">
            <Link to="/interests" className="block p-8 text-center">
              <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">Media Worth Your Time</h3>
              <p className="text-foreground/70 mb-6 leading-relaxed">
                What I'm watching, reading, and playing right now
              </p>
              <div className="flex items-center justify-center text-primary font-medium group-hover:translate-x-1 transition-transform">
                Explore Media
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </Link>
          </Card>
            </div>
          </div>

          {/* Right side - Title */}
          <div className="col-span-12 lg:col-span-3 order-1 lg:order-2">
            <div className="sticky top-16 md:top-24 pb-4 md:pb-8 text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold font-heading mb-6 bg-primary bg-clip-text text-transparent leading-[1.2] pb-2">Explore More</h2>
              <p className="text-lg text-foreground/70 leading-relaxed">A bit more on me</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;


