import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from '@/contexts/ThemeContext';
import Navigation from "./components/Navigation";
import VersionMark from "./components/VersionMark";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Experience from "./pages/Experience";
import Interests from "./pages/Interests";
import Photos from "./pages/Photos";
import Preloader from "./components/Preloader";
import ReactGA from 'react-ga4';
import { HelmetProvider } from 'react-helmet-async';

// Initialize Google Analytics with YOUR Measurement ID
ReactGA.initialize('G-X9J979V7LF');

const queryClient = new QueryClient();

// Component to track route changes
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
    // Simulate loading time and wait for page to be fully loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Also hide preloader when page is fully loaded
    const handleLoad = () => {
      setTimeout(() => setIsLoading(false), 500);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    // Bike Share project scrolls to #bike-share-demo from ProjectDetail after mount
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
      <div className={`min-h-screen bg-background text-foreground transition-opacity duration-500 ${
        isLoading ? 'opacity-0' : 'opacity-100'
      }`}>
        <Navigation />
        <VersionMark />
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
