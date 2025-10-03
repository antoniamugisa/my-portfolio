import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, Share2, User } from 'lucide-react';
import { blogPosts } from '@/data/blog';
import { useToast } from '@/hooks/use-toast';

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  // Find the blog post by ID
  const post = blogPosts.find(p => p.id === id);
  
  // If post not found, redirect to blog page
  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).toUpperCase();
  };

  // Share functionality
  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: url,
        });
      } catch (error) {
        // Handle sharing error silently
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "The blog post link has been copied to your clipboard.",
        });
      } catch (error) {
        // Handle clipboard error silently
      }
    }
  };

  // Convert markdown-like content to JSX (basic implementation)
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentElement: string[] = [];
    let inCodeBlock = false;
    let codeLanguage = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <div key={i} className="bg-muted p-4 rounded-lg my-6 overflow-x-auto">
              <code className="text-sm text-foreground font-mono whitespace-pre">
                {currentElement.join('\n')}
              </code>
            </div>
          );
          currentElement = [];
          inCodeBlock = false;
        } else {
          // Start code block
          codeLanguage = line.substring(3);
          inCodeBlock = true;
        }
        continue;
      }
      
      if (inCodeBlock) {
        currentElement.push(line);
        continue;
      }

      // Handle iframe embeds (like Spotify)
      if (line.trim().startsWith('<iframe')) {
        // Extract iframe attributes
        const srcMatch = line.match(/src="([^"]+)"/);
        const widthMatch = line.match(/width="([^"]+)"/);
        const heightMatch = line.match(/height="([^"]+)"/);
        const frameborderMatch = line.match(/frameborder="([^"]+)"/);
        const allowtransparencyMatch = line.match(/allowtransparency="([^"]+)"/);
        const allowMatch = line.match(/allow="([^"]+)"/);
        
        if (srcMatch) {
          elements.push(
            <div key={i} className="my-6 rounded-lg overflow-hidden">
              <iframe
                src={srcMatch[1]}
                width={widthMatch ? widthMatch[1] : "100%"}
                height={heightMatch ? heightMatch[1] : "152"}
                frameBorder={frameborderMatch ? frameborderMatch[1] : "0"}
                allowTransparency={allowtransparencyMatch ? allowtransparencyMatch[1] === "true" : true}
                allow={allowMatch ? allowMatch[1] : "encrypted-media"}
                className="w-full"
              />
            </div>
          );
        }
        continue;
      }

      // Handle headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-4xl font-bold font-heading mt-8 mb-4 text-foreground">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-3xl font-semibold mt-8 mb-4 text-foreground">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-2xl font-medium mt-6 mb-3 text-foreground">
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('- ')) {
        // Handle list items (basic implementation)
        elements.push(
          <li key={i} className="ml-6 mb-2 text-foreground/80 leading-relaxed">
            {line.substring(2)}
          </li>
        );
      } else if (line.trim() === '') {
        // Empty line - add spacing
        elements.push(<div key={i} className="h-4" />);
      } else if (line.trim()) {
        // Regular paragraph
        elements.push(
          <p key={i} className="text-foreground/80 leading-relaxed mb-4">
            {line}
          </p>
        );
      }
    }

    return elements;
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Back Button */}
      <div className="container mx-auto px-6 max-w-4xl mb-8">
        <Link to="/blog">
          <Button variant="ghost" className="group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to my Thoughts
          </Button>
        </Link>
      </div>

      {/* Article Header */}
      <article className="container mx-auto px-6 max-w-4xl">
        {/* Hero Image with Overlay */}
        <div className="relative aspect-video md:aspect-[21/9] overflow-hidden rounded-lg mb-8 shadow-card">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Content Overlay */}
          <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
            {/* Top Right - Tags */}
            <div className="flex justify-end">
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 2).map((tag) => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30"
                  >
                    {tag}
                  </span>
                ))}
                {post.tags.length > 2 && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30">
                    +{post.tags.length - 2}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Left - Date, Title, Subtitle */}
            <div className="space-y-3">
              {/* Date */}
              <div className="text-white/90 text-sm font-medium">
                {formatDate(post.date)}
              </div>
              
              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {post.title}
              </h1>
              
              {/* Subtitle/Description */}
              <p className="text-white/90 text-lg md:text-xl leading-relaxed max-w-2xl">
                {post.description}
              </p>
            </div>
          </div>
        </div>

        {/* Article Meta - Moved below image */}
        <div className="mb-8">
          <div className="flex items-center justify-between border-b border-border pb-6">
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime} min read</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-16">
          {renderContent(post.content)}
        </div>
      </article>

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

export default BlogPost;