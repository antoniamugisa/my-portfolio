import React from 'react';

const Preloader = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
      <div className="relative w-24 h-24">
        {/* Loading circle with progress */}
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="hsl(var(--primary) / 0.2)"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            fill="none"
            strokeDasharray="62.83"
            strokeDashoffset="62.83"
            strokeLinecap="round"
            className="animate-[loading-bar_2s_ease-in-out_infinite]"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">AM</span>
        </div>
      </div>
    </div>
  );
};

export default Preloader;