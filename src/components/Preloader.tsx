import React from 'react';
import { Code2 } from 'lucide-react';

const Preloader = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Animated Logo */}
        <div className="relative">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-spin"></div>
            {/* Inner pulsing ring */}
            <div className="absolute inset-2 border-2 border-primary rounded-full animate-pulse"></div>
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Code2 className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Loading
          </h2>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-primary rounded-full animate-[loading-bar_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;