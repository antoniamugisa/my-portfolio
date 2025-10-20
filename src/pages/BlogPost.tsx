import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Share2, User } from 'lucide-react';
import { blogPosts } from '@/data/blog';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// Define a type for code block props
type CodeRendererProps = {
  inline?: boolean;
  className?: string;
  children: React.ReactNode[];
};

// Typed markdown components
const markdownComponents: Components = {
  // Code blocks & inline code
  code({ inline, className, children, ...props }: CodeRendererProps) {
    // Cast props for TypeScript
    const codeProps = props as React.HTMLAttributes<HTMLElement>;
    if (inline) {
      return (
        <code className="bg-muted/50 px-1 rounded text-sm font-mono" {...codeProps}>
          {children}
        </code>
      );
    }
    return (
      <pre className="bg-muted p-4 rounded-lg my-4 overflow-x-auto">
        <code className={className} {...codeProps}>
          {children}
        </code>
      </pre>
    );
  },
  // Paragraphs
  p({ children, ...props }) {
    return (
      <p className="mb-4 text-foreground/80 leading-relaxed" {...props}>
        {children}
      </p>
    );
  },
  // Headings
  h1({ children, ...props }) {
    return (
      <h1 className="text-4xl font-bold mt-8 mb-4" {...props}>
        {children}
      </h1>
    );
  },
  h2({ children, ...props }) {
    return (
      <h2 className="text-3xl font-semibold mt-8 mb-4" {...props}>
        {children}
      </h2>
    );
  },
  h3({ children, ...props }) {
    return (
      <h3 className="text-2xl font-medium mt-6 mb-3" {...props}>
        {children}
      </h3>
    );
  },
  li({ children, ...props }) {
    return (
      <li className="ml-6 mb-2 list-disc" {...props}>
        {children}
      </li>
    );
  },
  // Iframes
  iframe({ ...props }) {
    return (
      <div className="my-6 rounded-lg overflow-hidden">
        <iframe className="w-full" {...props} />
      </div>
    );
  },
};

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  // Find blog post by ID
  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // Format date
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).toUpperCase();

  // Share functionality
  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.description,
          url,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: 'Link copied!',
          description: 'The blog post link has been copied to your clipboard.',
        });
      } catch {}
    }
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
        {/* Hero Image */}
        <div className="relative aspect-video md:aspect-[21/9] overflow-hidden rounded-lg mb-8 shadow-card">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
            {/* Tags */}
            <div className="flex justify-end">
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30">
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

            {/* Title & Description */}
            <div className="space-y-3">
              <div className="text-white/90 text-sm font-medium">{formatDate(post.date)}</div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">{post.title}</h1>
              <p className="text-white/90 text-lg md:text-xl leading-relaxed max-w-2xl">{post.description}</p>
            </div>
          </div>
        </div>

        {/* Article Meta */}
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

            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-16">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={markdownComponents}
          >
            {post.content}
          </ReactMarkdown>
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
