import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, Share2, User } from 'lucide-react';
import { blogPosts } from '@/data/blogPosts';
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
      month: 'long', 
      day: 'numeric'
    });
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
        console.log('Error sharing:', error);
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
        console.log('Error copying to clipboard:', error);
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

      // Handle headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-4xl font-bold mt-8 mb-4 text-foreground">
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
            Back to Blog
          </Button>
        </Link>
      </div>

      {/* Article Header */}
      <article className="container mx-auto px-6 max-w-4xl">
        {/* Hero Image */}
        <div className="aspect-video md:aspect-[21/9] overflow-hidden rounded-lg mb-8 shadow-card">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Meta */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
            {post.category}
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readTime} min read</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-border pb-6">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShare}
              className="ml-4"
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

        {/* Related Posts Section */}
        <Card className="p-8 bg-gradient-secondary border-border/50 mb-16">
          <h3 className="text-2xl font-semibold mb-6 text-center">Read More</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {blogPosts
              .filter(p => p.id !== post.id && p.category === post.category)
              .slice(0, 2)
              .map((relatedPost) => (
                <Link key={relatedPost.id} to={`/blog/${relatedPost.id}`} className="group">
                  <Card className="p-6 bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 h-full">
                    <div className="aspect-video overflow-hidden rounded-lg mb-4">
                      <img 
                        src={relatedPost.image} 
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {relatedPost.title}
                    </h4>
                    <p className="text-sm text-foreground/70 line-clamp-2">
                      {relatedPost.description}
                    </p>
                  </Card>
                </Link>
              ))}
          </div>
          {blogPosts.filter(p => p.id !== post.id && p.category === post.category).length === 0 && (
            <div className="text-center text-muted-foreground">
              <p>No related posts found in this category.</p>
              <Link to="/blog" className="text-primary hover:underline">
                Browse all posts
              </Link>
            </div>
          )}
        </Card>
      </article>
    </div>
  );
};

export default BlogPost;