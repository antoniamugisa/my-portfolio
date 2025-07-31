import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Preloader from "./components/Preloader";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {isLoading && <Preloader />}
        <div className={`min-h-screen bg-background text-foreground transition-opacity duration-500 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}>
          <Navigation />
          <Index />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
