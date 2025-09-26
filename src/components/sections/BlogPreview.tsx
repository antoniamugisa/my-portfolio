import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { blogPosts } from '@/data/blogPosts';

const BlogPreview: React.FC = () => {
  const recentBlogs = blogPosts.slice(0, 3);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <section id="blog" className="py-24 bg-background">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">thoughts</h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">sharing my thoughts and experiences navigating tech and life</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {recentBlogs.map((post, index) => (
            <Card key={index} className="overflow-hidden bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card group cursor-pointer">
              <Link to={`/blog/${post.id}`}>
                <div className="aspect-video overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-foreground/60 mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.date)}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h4 className="text-lg font-bold text-primary mb-3 group-hover:text-primary/80 transition-colors">{post.title}</h4>
                  <p className="text-foreground/80 text-sm leading-relaxed line-clamp-3 mb-4">{post.description}</p>
                  <div className="flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                    read more
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <Link to="/blog">
            <Button size="lg" variant="outline" className="border-border hover:border-primary/50 hover:text-primary group">
              <BookOpen className="w-4 h-4 mr-2" />
              view all posts
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;


