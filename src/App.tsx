import React, { useState, useEffect, lazy, Suspense } from 'react';
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

// Route pages load on demand so navigating feels instant (esp. Photos ~4MB of full images).
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

const AppContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // First paint only — no artificial 2s delay.
    const hide = () => setIsLoading(false);
    if (document.readyState === 'complete') {
      hide();
      return;
    }
    window.addEventListener('load', hide);
    // Fallback so we never stick on the preloader.
    const timer = setTimeout(hide, 400);
    return () => {
      window.removeEventListener('load', hide);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (
      location.pathname === '/projects/bike-share-toronto' &&
      location.hash === '#bike-share-demo'
    ) {
      return;
    }
    window.scrollTo(0, 0);
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
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/projects" element={<Projects />} />
            <Route
              path="/projects/bike-share-toronto/map"
              element={<Navigate to="/projects/bike-share-toronto#bike-share-demo" replace />}
            />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/interests" element={<Interests />} />
            <Route path="/photos" element={<Photos />} />
          </Routes>
        </Suspense>
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
