import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink } from 'lucide-react';

interface LinkPreviewProps {
  href: string;
  children: React.ReactNode;
}

function metadataFromUrl(url: string) {
  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname.replace(/^www\./, '');
    const pathLabel = decodeURIComponent(urlObj.pathname.replace(/\/$/, '').split('/').pop() || '')
      .replace(/[-_]/g, ' ')
      .trim();
    return {
      title: pathLabel || host,
      description: url,
      siteName: host,
    };
  } catch {
    return {
      title: url,
      description: url,
      siteName: undefined as string | undefined,
    };
  }
}

const LinkPreview: React.FC<LinkPreviewProps> = ({ href, children }) => {
  const [showPreview, setShowPreview] = useState(false);
  const metadata = metadataFromUrl(href);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowPreview(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowPreview(false);
  };

  useEffect(() => {
    if (showPreview && linkRef.current && previewRef.current) {
      const updatePosition = () => {
        if (!linkRef.current || !previewRef.current) return;

        const linkRect = linkRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top = linkRect.bottom + 10;
        let left = linkRect.left;

        const previewHeight = 160;
        if (linkRect.bottom + previewHeight + 20 > viewportHeight) {
          top = linkRect.top - previewHeight - 10;
          if (top < 20) top = 20;
        }

        const previewWidth = 320;
        if (left + previewWidth > viewportWidth - 20) {
          left = viewportWidth - previewWidth - 20;
        }
        if (left < 20) left = 20;

        previewRef.current.style.top = `${top}px`;
        previewRef.current.style.left = `${left}px`;
      };

      setTimeout(updatePosition, 0);
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [showPreview]);

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

      {showPreview &&
        createPortal(
          <div
            ref={previewRef}
            className="fixed z-[9999] w-80 bg-card border border-border rounded-lg shadow-xl overflow-hidden"
            onMouseEnter={() => setShowPreview(true)}
            onMouseLeave={handleMouseLeave}
          >
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
                <div className="text-xs text-muted-foreground line-clamp-2 break-all">
                  {metadata.description}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default LinkPreview;
