import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { blogPosts } from '@/data/blog';

const Blog = () => {

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
        <div className="min-h-screen bg-background pt-4 md:pt-24 pb-24 md:pb-0">
      {/* Main Layout */}
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-4 md:gap-8">
          {/* Left Side - Title Section */}
          <div className="lg:col-span-3 py-4 md:py-16">
            <div className="sticky top-16 md:top-32 pb-4 md:pb-16">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold font-heading mb-4 md:mb-6 bg-primary bg-clip-text text-transparent leading-[1.2] pb-2">
                thoughts
              </h1>
              <p className="text-lg text-foreground/70 leading-relaxed">
                what's been on my mind lately
              </p>
            </div>
          </div>

          {/* Right Side - Content Section */}
          <div className="lg:col-span-9">
            {/* Blog Posts Grid */}
            <section className="py-4 md:py-16">
              <div className="grid md:grid-cols-2 gap-4 md:gap-8">
                {blogPosts.map((post, index) => (
                    <div key={post.id} className="py-px">
                      <Link to={`/blog/${post.id}`}>
                        <div 
                          className="group relative h-48 md:h-64 rounded-lg overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                        {/* Background Image */}
                        <div className="absolute inset-0">
                          <img 
                            src={post.image} 
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Dark overlay for better text readability */}
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute inset-0 p-3 md:p-5 flex flex-col justify-between">
                          {/* Top content */}
                          <div className="flex-1 min-h-0">
                            <h3 className="text-lg md:text-xl font-bold text-white mb-2 leading-tight line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-white/90 text-sm leading-relaxed line-clamp-2 md:line-clamp-3">
                              {post.description}
                            </p>
                          </div>

                          {/* Bottom content */}
                          <div className="space-y-2 mt-2 md:mt-3">
                            <div className="text-white/80 text-xs">
                              {formatDate(post.date)}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {post.tags.slice(0, 2).map((tag) => (
                                <span 
                                  key={tag}
                                  className="px-2 py-1 bg-white/25 backdrop-blur-sm rounded-md text-white text-xs font-medium border border-white/20"
                                >
                                  {tag}
                                </span>
                              ))}
                              {post.tags.length > 2 && (
                                <span className="px-2 py-1 bg-white/25 backdrop-blur-sm rounded-md text-white text-xs font-medium border border-white/20">
                                  +{post.tags.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        </div>
                      </Link>
                    </div>
                  ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border pb-24 md:pb-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-foreground/70 text-sm">
            © 2025 Antonia Mugisa. Built with React, TypeScript & Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Blog;