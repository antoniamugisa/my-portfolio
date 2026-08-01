import React, { useState, useEffect, useRef, lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from '@/contexts/ThemeContext';
import Navigation from "./components/Navigation";
import VersionMark from "./components/VersionMark";
import Index from "./pages/Index";
import Preloader from "./components/Preloader";
import ReactGA from 'react-ga4';
import { HelmetProvider } from 'react-helmet-async';

const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Experience = lazy(() => import("./pages/Experience"));
const Interests = lazy(() => import("./pages/Interests"));
const Photos = lazy(() => import("./pages/Photos"));

ReactGA.initialize('G-X9J979V7LF');

const queryClient = new QueryClient();

const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);

  return null;
};

/** Main nav pages that should stay mounted after first visit (images stay warm). */
type CacheKey = 'home' | 'experience' | 'projects' | 'blog' | 'interests' | 'photos';

function pathToCacheKey(pathname: string): CacheKey | null {
  if (pathname === '/') return 'home';
  if (pathname === '/experience') return 'experience';
  if (pathname === '/projects') return 'projects';
  if (pathname === '/blog') return 'blog';
  if (pathname === '/interests') return 'interests';
  if (pathname === '/photos') return 'photos';
  return null;
}

function CachedPage({
  active,
  keepPainted = false,
  children,
}: {
  active: boolean;
  /** Prefer for image-heavy pages — display:none drops decoded bitmaps. */
  keepPainted?: boolean;
  children: ReactNode;
}) {
  if (keepPainted) {
    return (
      <div
        aria-hidden={!active}
        style={
          active
            ? undefined
            : {
                position: 'fixed',
                inset: 0,
                visibility: 'hidden',
                pointerEvents: 'none',
                zIndex: -1,
              }
        }
      >
        {children}
      </div>
    );
  }

  return (
    <div
      hidden={!active}
      style={{ display: active ? undefined : 'none' }}
      aria-hidden={!active}
    >
      {children}
    </div>
  );
}

/**
 * Keeps list pages mounted after first visit so returning doesn't re-decode
 * cover images / remount the whole tree. Detail routes still mount/unmount.
 */
const PersistentPages = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const activeKey = pathToCacheKey(pathname);

  const [mounted, setMounted] = useState<Record<CacheKey, boolean>>({
    home: true,
    experience: false,
    projects: false,
    blog: false,
    interests: false,
    photos: false,
  });

  useEffect(() => {
    if (!activeKey) return;
    setMounted((prev) => (prev[activeKey] ? prev : { ...prev, [activeKey]: true }));
  }, [activeKey]);

  const show = (key: CacheKey) => mounted[key] || activeKey === key;

  const isDetailRoute =
    pathname.startsWith('/blog/') ||
    (pathname.startsWith('/projects/') && pathname !== '/projects');

  return (
    <>
      <Suspense fallback={null}>
        {show('home') && (
          <CachedPage active={activeKey === 'home'}>
            <Index />
          </CachedPage>
        )}
        {show('experience') && (
          <CachedPage active={activeKey === 'experience'}>
            <Experience />
          </CachedPage>
        )}
        {show('projects') && (
          <CachedPage active={activeKey === 'projects'}>
            <Projects />
          </CachedPage>
        )}
        {show('blog') && (
          <CachedPage active={activeKey === 'blog'}>
            <Blog />
          </CachedPage>
        )}
        {show('interests') && (
          <CachedPage active={activeKey === 'interests'}>
            <Interests />
          </CachedPage>
        )}
        {show('photos') && (
          <CachedPage active={activeKey === 'photos'} keepPainted>
            <Photos />
          </CachedPage>
        )}
      </Suspense>

      {/* Detail + redirects — not cached (unique per id, can be heavy) */}
      {isDetailRoute || pathname === '/projects/bike-share-toronto/map' ? (
        <Suspense fallback={null}>
          <Routes>
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route
              path="/projects/bike-share-toronto/map"
              element={<Navigate to="/projects/bike-share-toronto#bike-share-demo" replace />}
            />
            <Route path="/projects/:id" element={<ProjectDetail />} />
          </Routes>
        </Suspense>
      ) : null}
    </>
  );
};

const AppContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const hide = () => setIsLoading(false);
    if (document.readyState === 'complete') {
      hide();
      return;
    }
    window.addEventListener('load', hide);
    const timer = setTimeout(hide, 400);
    return () => {
      window.removeEventListener('load', hide);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = location.pathname;

    if (
      location.pathname === '/projects/bike-share-toronto' &&
      location.hash === '#bike-share-demo'
    ) {
      return;
    }

    // Only jump to top when the path actually changes (not when revealing a cached page's prior scroll… we still reset for consistent nav).
    if (prev !== location.pathname) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  return (
    <>
      <Toaster />
      <Sonner />
      {isLoading && <Preloader />}
      <div className={`min-h-screen bg-background text-foreground transition-opacity duration-300 ${
        isLoading ? 'opacity-0' : 'opacity-100'
      }`}>
        <Navigation />
        <VersionMark />
        <PersistentPages />
      </div>
    </>
  );
};


const App = () => {
  return (
    <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Router>
            <Analytics />
            <AppContent />
          </Router>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
