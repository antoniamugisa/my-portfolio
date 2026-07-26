import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, Share2, User } from 'lucide-react';
import { blogPosts } from '@/data/blog';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import LinkPreview from '@/components/LinkPreview';

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
      <p className="mb-4 font-normal text-[15px] md:text-base text-foreground/70 leading-relaxed" {...props}>
        {children}
      </p>
    );
  },
  // Headings
  h1({ children, ...props }) {
    return (
      <h1 className="mt-8 mb-4 font-normal text-[15px] md:text-base text-foreground leading-relaxed" {...props}>
        {children}
      </h1>
    );
  },
  h2({ children, ...props }) {
    return (
      <h2 className="mt-8 mb-4 font-normal text-[15px] md:text-base text-foreground leading-relaxed" {...props}>
        {children}
      </h2>
    );
  },
  h3({ children, ...props }) {
    return (
      <h3 className="mt-6 mb-3 font-normal text-[15px] md:text-base text-foreground leading-relaxed" {...props}>
        {children}
      </h3>
    );
  },
  li({ children, ...props }) {
    return (
      <li className="ml-6 mb-2 list-disc font-normal text-[15px] md:text-base text-foreground/70 leading-relaxed" {...props}>
        {children}
      </li>
    );
  },
  // Iframes — if `allow` lists fullscreen, omit allowFullScreen (React: allow takes precedence)
  iframe({ allowFullScreen, allow, ...props }) {
    const allowStr = typeof allow === 'string' ? allow : '';
    const fullscreenInAllow = /\bfullscreen\b/i.test(allowStr);
    return (
      <div className="my-6 rounded-lg overflow-hidden">
        <iframe
          className="w-full"
          {...props}
          {...(allow !== undefined ? { allow } : {})}
          {...(fullscreenInAllow ? {} : allowFullScreen !== undefined ? { allowFullScreen } : {})}
        />
      </div>
    );
  },
  // Links with preview
  a({ href, children, ...props }: any) {
    // Extract href from props if not directly available (for HTML links)
    const linkHref = href || props.href || (props as any).node?.properties?.href;
    if (!linkHref) return <a {...props}>{children}</a>;
    
    // Only show preview for external links
    const isExternal = linkHref.startsWith('http://') || linkHref.startsWith('https://');
    
    if (isExternal) {
      return <LinkPreview href={linkHref}>{children}</LinkPreview>;
    }
    
    return (
      <a href={linkHref} className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors" {...props}>
        {children}
      </a>
    );
  },
};

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

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
    <div className="min-h-screen bg-background pt-24 md:pt-28">
      {/* Article Header */}
      <article className="mx-auto w-full max-w-5xl px-4 md:px-6">
        {/* Hero Image */}
        <div className="relative h-[520px] sm:h-[600px] md:h-auto md:aspect-[21/9] overflow-hidden rounded-lg mb-8 shadow-card">
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
            <div className="space-y-3 text-[15px] md:text-base leading-relaxed">
              <div className="text-white/90 font-normal">{formatDate(post.date)}</div>
              <h1 className="font-normal text-white leading-relaxed">{post.title}</h1>
              <p
                className="text-white/90 font-normal leading-relaxed max-w-2xl"
                dangerouslySetInnerHTML={{ __html: post.description }}
              />
            </div>
          </div>
        </div>

        {/* Article Meta */}
        <div className="mb-8 text-[15px] md:text-base">
          <div className="flex items-center justify-between border-b border-border pb-6">
            <div className="flex flex-wrap items-center gap-6 text-foreground/70">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-normal">{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-normal">{post.readTime} min read</span>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-none mb-12 pb-16 text-[15px] md:text-base">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={markdownComponents}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>

    </div>
  );
};

export default BlogPost;
