import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink } from 'lucide-react';

interface LinkPreviewProps {
  href: string;
  children: React.ReactNode;
}

interface LinkMetadata {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

const LinkPreview: React.FC<LinkPreviewProps> = ({ href, children }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Fetch link metadata using a CORS proxy
  const fetchMetadata = async (url: string) => {
    try {
      setLoading(true);
      // Use a CORS proxy to fetch the page HTML
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (response.ok) {
        const data = await response.json();
        const html = data.contents;
        
        // Parse HTML to extract metadata
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const getMetaContent = (name: string, property?: string) => {
          if (property) {
            return doc.querySelector(`meta[property="${property}"]`)?.getAttribute('content') ||
                   doc.querySelector(`meta[name="${name}"]`)?.getAttribute('content');
          }
          return doc.querySelector(`meta[name="${name}"]`)?.getAttribute('content');
        };

        const title = getMetaContent('og:title', 'og:title') || 
                     doc.querySelector('title')?.textContent || 
                     getMetaContent('twitter:title', 'twitter:title');
        
        const description = getMetaContent('og:description', 'og:description') || 
                           getMetaContent('description') ||
                           getMetaContent('twitter:description', 'twitter:description');
        
        const image = getMetaContent('og:image', 'og:image') || 
                     getMetaContent('twitter:image', 'twitter:image');
        
        const siteName = getMetaContent('og:site_name', 'og:site_name');

        try {
          const urlObj = new URL(url);
          setMetadata({
            title: title || urlObj.hostname,
            description: description || url,
            image: image ? (image.startsWith('http') ? image : new URL(image, url).href) : undefined,
            siteName: siteName || urlObj.hostname.replace('www.', ''),
          });
        } catch {
          setMetadata({
            title: title || url,
            description: description || url,
            image,
            siteName,
          });
        }
      }
    } catch (error) {
      // Fallback: extract basic info from URL
      try {
        const urlObj = new URL(url);
        setMetadata({
          title: urlObj.hostname.replace('www.', ''),
          description: url,
          siteName: urlObj.hostname.replace('www.', ''),
        });
      } catch {
        setMetadata({
          title: href,
          description: href,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle mouse enter
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setShowPreview(true);
      // Always fetch metadata when showing preview
      if (!metadata && !loading) {
        fetchMetadata(href);
      }
    }, 300); // Delay before showing preview (reduced from 500ms)
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowPreview(false);
  };

  // Position preview relative to link
  useEffect(() => {
    if (showPreview && linkRef.current && previewRef.current) {
      const updatePosition = () => {
        if (!linkRef.current || !previewRef.current) return;
        
        const linkRect = linkRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Position preview below the link by default (using viewport coordinates for fixed positioning)
        let top = linkRect.bottom + 10;
        let left = linkRect.left;

        // Adjust if preview goes off screen vertically
        const previewHeight = 400; // max height
        if (linkRect.bottom + previewHeight + 20 > viewportHeight) {
          // Position above the link
          top = linkRect.top - previewHeight - 10;
          // If still off screen, position at top of viewport
          if (top < 20) {
            top = 20;
          }
        }

        // Adjust if preview goes off screen horizontally
        const previewWidth = 320; // w-80 = 320px
        if (left + previewWidth > viewportWidth - 20) {
          left = viewportWidth - previewWidth - 20;
        }
        if (left < 20) {
          left = 20;
        }

        previewRef.current.style.top = `${top}px`;
        previewRef.current.style.left = `${left}px`;
      };

      // Small delay to ensure DOM is ready
      setTimeout(updatePosition, 0);
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [showPreview, metadata]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <a
        ref={linkRef}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </a>
      
      {showPreview && createPortal(
        <div
          ref={previewRef}
          className="fixed z-[9999] w-80 bg-card border border-border rounded-lg shadow-xl overflow-hidden"
          style={{ maxHeight: '400px' }}
          onMouseEnter={() => setShowPreview(true)}
          onMouseLeave={handleMouseLeave}
        >
          {loading ? (
            <div className="p-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : metadata ? (
            <>
              {metadata.image && (
                <div className="w-full h-40 bg-muted overflow-hidden">
                  <img
                    src={metadata.image}
                    alt={metadata.title || 'Preview'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="p-4">
                {metadata.siteName && (
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    {metadata.siteName}
                  </div>
                )}
                {metadata.title && (
                  <h4 className="font-semibold text-sm mb-2 line-clamp-2">{metadata.title}</h4>
                )}
                {metadata.description && (
                  <div className="text-xs text-muted-foreground line-clamp-3">{metadata.description}</div>
                )}
              </div>
            </>
          ) : (
            <div className="p-4">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                {new URL(href).hostname.replace('www.', '')}
              </div>
              <div className="text-sm font-medium break-all">{href}</div>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
};

export default LinkPreview;
